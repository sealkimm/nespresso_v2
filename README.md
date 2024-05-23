# nespresso 

네스프레소 프로모션 페이지 Vue3  
local url: http://localhost:8010/캠페인폴더/index.html

## 퍼블리싱 환경 빌드 가이드
1. node.js 설치 (18버전 권장 - 2024.1월 기준) 
2. 프로젝트 원격 저장소 클론  
```
git clone <원격저장소>.git
```
3. clone 받은 폴더에 프로젝트 관련 모듈 설치
```
npm install
```
4. 프로젝트 실행
```
npm run start
```
## Gulp 환경 구성  
프로젝트 루트 경로에 `gulpfile.babel.js` 파일에 정의  
설치된 모듈은 `package.json`에 저장
### Gulp 기능
html: html 마크업 템플릿 구성 및 빌드  
css: scss -> 관련 scss 파일 하나의 파일로 묶어서 변환  
spirte: css 스프라이트 관련 이미지 추출 및 webp 파일 변환  
serve: `dist`폴더 기준으로 로컬 서버 구동  
watchFile: html, css, sprite 파일 수정 될때마다 감지하여 삭제 후 빌드
## 프로젝트 폴더 구성
<table class="table table-bordered">
	<colgroup>
		<col class="col-xs-1">
		<col class="col-xs-1">
		<col class="col-xs-1">
		<col class="col-xs-5">
	</colgroup>
	<thead>
		<tr>
			<th>1depth</th>
			<th>2depth</th>
			<th>3depth</th>
			<th>설명</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>package.json</td>
			<td>-</td>
			<td>-</td>
			<td>프로젝트 정보 설정파일</td>
		</tr>
		<tr>
			<td>node_modules</td>
			<td>-</td>
			<td>-</td>
			<td>nodejs 모듈 디렉토리 (npm install 후 생성됨)</td>
		</tr>
		<tr>
			<td>.gitignore</td>
			<td>-</td>
			<td>-</td>
			<td>git 버전관리 제외 대상 설정파일</td>
		</tr>
		<tr>
			<td>gulpfile.babel.js</td>
			<td>-</td>
			<td>-</td>
			<td>Gulp Task 설정파일</td>
		</tr>
		<tr>
			<td>.browserslistrc</td>
			<td>-</td>
			<td>-</td>
			<td>autoprefixer 브라우저 지원범위 설정파일</td>
		</tr>
		<tr>
			<td>.htmlhintrc</td>
			<td>-</td>
			<td>-</td>
			<td>HTML 구문 검사 설정파일</td>
		</tr>
		<tr>
			<td>.stylelintrc.json</td>
			<td>-</td>
			<td>-</td>
			<td>SCSS 구문 검사 설정파일</td>
		</tr>
    <tr>
			<td>.eslintrc.json</td>
			<td>-</td>
			<td>-</td>
			<td>JS 구문 검사 설정파일</td>
		</tr>
    <tr>
			<td>.prettierrc.js</td>
			<td>-</td>
			<td>-</td>
			<td>Prettier 정렬 설정 파일</td>
		</tr>
    <tr>
			<td>.prettieringnore.js</td>
			<td>-</td>
			<td>-</td>
			<td>Prettier 정렬 제외 설정 파일</td>
		</tr>
    <tr>
			<td>dist</td>
			<td>-</td>
			<td>-</td>
			<td>로컬웹서버 디렉토리/ 배포파일 디렉토리</td>
		</tr>
    <tr>
			<td></td>
			<td>css</td>
			<td>-</td>
			<td>scss -> css 변환 완료된 배포관련 css</td>
		</tr>
    <tr>
			<td></td>
			<td>img</td>
			<td>-</td>
			<td>배포 img</td>
		</tr>
    <tr>
			<td></td>
			<td>html</td>
			<td>-</td>
			<td>빌드 완료 된 배포관련 HTML</td>
		</tr>
    <tr>
			<td>src</td>
			<td>-</td>
			<td>-</td>
			<td>소스파일 디렉토리.</td>
		</tr>
    <tr>
			<td></td>
			<td>html</td>
			<td>-</td>
			<td>html 소스 디렉토리</td>
		</tr>
    <tr>
			<td></td>
			<td>img</td>
			<td>-</td>
			<td>spirte icon img 디렉토리</td>
		</tr>
    <tr>
			<td></td>
			<td>scss</td>
			<td>-</td>
			<td>SCSS 소스 디렉토리</td>
		</tr>
    <tr>
			<td></td>
			<td></td>
			<td>base</td>
			<td>Reset 및 공통환경</td>
		</tr>
		<tr>
			<td></td>
			<td></td>
			<td>helpers</td>
			<td>환경변수, 함수, 믹스인</td>
		</tr>
		<tr>
			<td></td>
			<td></td>
			<td>redefine</td>
			<td>네스프레소 브랜드사이트 관련 스타일 재정의</td>
		</tr>
		<tr>
			<td></td>
			<td></td>
			<td>vendors</td>
			<td>spirte 관련 스타일</td>
		</tr>
    <tr>
			<td></td>
			<td></td>
			<td>*.scss</td>
			<td>캠페인 관련 스타일</td>
		</tr>
    <tr>
			<td></td>
			<td></td>
			<td>compoenent</td>
			<td>캠페인 관련 컴포넌트 스타일</td>
		</tr>
    <tr>
			<td></td>
			<td></td>
			<td>page</td>
			<td>캠페인관련 스타일</td>
		</tr>
  </tbody>
</table>
