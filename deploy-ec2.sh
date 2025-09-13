#!/bin/bash

# 스크립트 실행 중 오류가 발생하면 즉시 중단
set -e

# ==============================================================================
# .env.ec2 파일 로드
# 이 스크립트와 같은 경로에 .env.ec2 파일이 있으면 환경 변수를 로드합니다.
# ==============================================================================
if [ -f "$(dirname "$0")/.env.ec2" ]; then
    echo ".env.ec2 파일을 로드합니다."
    export $(cat "$(dirname "$0")/.env.ec2" | sed 's/#.*//g' | xargs)
fi

# ==============================================================================
# 설정 변수 (환경 변수에서 값을 가져옵니다)
# .env.ec2 파일에 아래 값들을 설정해주세요.
# ==============================================================================

# AWS 설정
AWS_REGION=${AWS_REGION:?"AWS_REGION이 설정되지 않았습니다."}
ECR_REPOSITORY_NAME=${ECR_REPOSITORY_NAME:?"ECR_REPOSITORY_NAME이 설정되지 않았습니다."}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
AWS_PROFILE_NAME=${AWS_PROFILE_NAME:-""}

# Docker 빌드 설정
VITE_API_BASE_URL=${VITE_API_BASE_URL:?"VITE_API_BASE_URL이 설정되지 않았습니다."}

# EC2 배포 설정
EC2_SSH_USER=${EC2_SSH_USER:?"EC2_SSH_USER가 설정되지 않았습니다."}
EC2_HOST=${EC2_HOST:?"EC2_HOST가 설정되지 않았습니다."}
EC2_SSH_KEY=${EC2_SSH_KEY:?"EC2_SSH_KEY가 설정되지 않았습니다."}

# 컨테이너 실행 설정
CONTAINER_NAME=${CONTAINER_NAME:-"coconut-frontend-ec2"}
BACKEND_HOST=${BACKEND_HOST:-"127.0.0.1"} # Nginx가 프록시할 백엔드 주소
BACKEND_PORT=${BACKEND_PORT:-"3001"}

SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"

# 프로필 옵션 설정
PROFILE_OPTION=""
if [ -n "$AWS_PROFILE_NAME" ]; then
  PROFILE_OPTION="--profile $AWS_PROFILE_NAME"
fi

# AWS 계정 ID 가져오기
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text ${PROFILE_OPTION})
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ECR_URI}/${ECR_REPOSITORY_NAME}:${IMAGE_TAG}"

# ==============================================================================
# 스크립트 본문
# ==============================================================================

# 1. ECR 로그인
echo "Amazon ECR 로그인"
aws ecr get-login-password --region ${AWS_REGION} ${PROFILE_OPTION} | docker login --username AWS --password-stdin ${ECR_URI}

# 1-1. ECR 리포지토리 확인 및 자동 생성
echo "리포지토리'${ECR_REPOSITORY_NAME}' 확인 완료"
if ! aws ecr describe-repositories --repository-names "${ECR_REPOSITORY_NAME}" --region "${AWS_REGION}" ${PROFILE_OPTION} > /dev/null 2>&1; then
    echo "리포지토리가 존재하지 않아 새로 생성합니다."
    aws ecr create-repository \
        --repository-name "${ECR_REPOSITORY_NAME}" \
        --region "${AWS_REGION}" \
        --image-scanning-configuration scanOnPush=true \
        --image-tag-mutability MUTABLE \
        ${PROFILE_OPTION} > /dev/null
    echo "리포지토리 생성 완료"
fi

# 2. Docker 이미지 빌드
echo "Docker 이미지 빌드"
docker build \
    --platform linux/amd64 \
    --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    -t ${ECR_REPOSITORY_NAME}:${IMAGE_TAG} \
    -f Dockerfile.prod .

# 3. Docker 이미지 태깅 및 ECR에 푸시
echo "Docker 이미지를 ECR에 푸시: ${IMAGE_URI}"
docker tag ${ECR_REPOSITORY_NAME}:${IMAGE_TAG} ${IMAGE_URI}
docker push ${IMAGE_URI}

# 4. EC2에 배포
echo "EC2 인스턴스(${EC2_HOST})에 배포 시작"
ssh -i "${EC2_SSH_KEY}" -o StrictHostKeyChecking=no "${EC2_SSH_USER}@${EC2_HOST}" << EOF
    set -e

    # ECR 로그인
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

    # 최신 이미지 pull
    docker pull ${IMAGE_URI}

    # 기존 컨테이너 중지 및 삭제
    if [ \$(docker ps -a -q -f name=${CONTAINER_NAME}) ]; then
        echo "기존 '${CONTAINER_NAME}' 컨테이너를 중지하고 삭제합니다."
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
    fi

    # 새 컨테이너 실행
    echo "새로운 컨테이너 실행"
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p 80:80 \
        -e BACKEND_HOST=${BACKEND_HOST} \
        -e BACKEND_PORT=${BACKEND_PORT} \
        --restart always \
        ${IMAGE_URI}

    echo "EC2 배포 완료"
EOF

echo "웹사이트 주소: http://${EC2_HOST}"
