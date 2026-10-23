@echo off
cd server
echo Running test suite...
echo.

echo ============================================
echo Test 1: WebRTC Signaling System
echo ============================================
node test-signaling.js
set TEST1_RESULT=%ERRORLEVEL%

echo.
echo ============================================
echo Test 2: Performance Tracking Module
echo ============================================
node test-reports.js
set TEST2_RESULT=%ERRORLEVEL%

echo.
echo ============================================
echo Test 3: Session History Module
echo ============================================
node test-history.js
set TEST3_RESULT=%ERRORLEVEL%

echo.
echo ============================================
echo Test 4: Full System Integration
echo ============================================
node test-integration.js
set TEST4_RESULT=%ERRORLEVEL%

echo.
echo ============================================
echo TEST SUITE SUMMARY
echo ============================================
echo Test 1 (Signaling): %TEST1_RESULT%
echo Test 2 (Reports): %TEST2_RESULT%
echo Test 3 (History): %TEST3_RESULT%
echo Test 4 (Integration): %TEST4_RESULT%

cd ..
