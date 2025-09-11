#!/bin/bash

# 스크립트 실행 중 오류가 발생하면 즉시 중단
set -e

# ==============================================================================
# 설정 변수
# ==============================================================================

S3_BUCKET_NAME="coconut-frontend"
AWS_REGION="ap-northeast-2"
DISTRIBUTION_ID="E14JH6EVXFJKM1"
AWS_PROFILE_NAME="s3-deploy-manager"
S3_FOLDER_NAME="s3-cloudfront"

# 프로필이 지정된 경우 AWS CLI 명령어에 --profile 옵션을 추가
PROFILE_OPTION=""
if [ -n "$AWS_PROFILE_NAME" ]; then
  PROFILE_OPTION="--profile $AWS_PROFILE_NAME"
fi
# ==============================================================================
# 스크립트 본문
# ==============================================================================


# 1. 프로젝트 빌드
npm install
npm run build
echo "빌드 완료"

# 2. 빌드된 파일을 S3 버킷에 업로드
# --delete 옵션: S3 버킷에는 있지만 로컬 dist 폴더에는 없는 파일을 삭제
aws s3 sync ./dist s3://${S3_BUCKET_NAME}/${S3_FOLDER_NAME} --region ${AWS_REGION} --delete ${PROFILE_OPTION}
echo "'dist' 폴더의 데이터가 '${S3_BUCKET_NAME}' 버킷에 업로드됨"

# 3. CloudFront 캐시 무효화 
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*" ${PROFILE_OPTION}
echo "CloudFront 캐시 무효화 요청됨"

echo " 배포가 성공적으로 완료되었습니다. "
echo " http://${S3_BUCKET_NAME}.s3-website.${AWS_REGION}.amazonaws.com "