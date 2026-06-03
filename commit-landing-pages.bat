@echo off
cd /d "%~dp0"

echo Cleaning up any git lock files...
if exist .git\HEAD.lock del /f .git\HEAD.lock
if exist .git\index.lock del /f .git\index.lock
if exist .git\next-index-6.lock del /f .git\next-index-6.lock

set GIT_AUTHOR_NAME=Kin Leon Zinzombe
set GIT_AUTHOR_EMAIL=kinzinzombe07@gmail.com
set GIT_COMMITTER_NAME=Kin Leon Zinzombe
set GIT_COMMITTER_EMAIL=kinzinzombe07@gmail.com

echo.
echo --- Committing: audio landing page ---
git add apps/web/app/audio/page.tsx
git commit -m "feat(landing): add audio landing page (speakers ^& earbuds)"

echo.
echo --- Committing: flash drives landing page ---
git add apps/web/app/flash-drives/page.tsx
git commit -m "feat(landing): add flash drives landing page"

echo.
echo --- Committing: powerbanks landing page ---
git add apps/web/app/powerbanks/page.tsx
git commit -m "feat(landing): add powerbanks landing page"

echo.
echo --- Committing: DSTV landing page ---
git add apps/web/app/dstv/page.tsx
git commit -m "feat(landing): add DSTV ^& OpenView accessories landing page"

echo.
echo --- All commits done! Install framer-motion: ---
echo    bun install   (from the project root)
echo.
pause
