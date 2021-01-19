!macro customInstall
  DetailPrint "Register vex URI Handler"
  DeleteRegKey HKCR "vex"
  WriteRegStr HKCR "vex" "" "URL:vex"
  WriteRegStr HKCR "vex" "URL Protocol" ""
  WriteRegStr HKCR "vex\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "vex\shell" "" ""
  WriteRegStr HKCR "vex\shell\Open" "" ""
  WriteRegStr HKCR "vex\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend