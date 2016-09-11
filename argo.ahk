#SingleInstance ignore

FileRemoveDir, %A_WorkingDir%\lockfiles, 1
FileCreateDir, %A_WorkingDir%\lockfiles

#Persistent
SetTimer, CloseMailWarnings, 50
return

CloseMailWarnings:
   GetKeyState, state, w
   if state = D
      IfExist, %A_WorkingDir%\lockfiles\fuelrelease.lock
      {
        FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\fuelrelease.lock
      }
        
   GetKeyState, state, s
   if state = D
      IfExist, %A_WorkingDir%\lockfiles\fuelrelease.lock
      {
        FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\fuelrelease.lock
      }

    IfExist, %A_WorkingDir%\lockfiles\dostartenginecmd.lock
    {
        SendInput, t^a{Backspace}/engine{ENTER}
        FileDelete, %A_WorkingDir%\lockfiles\dostartenginecmd.lock
    }

    IfExist, %A_WorkingDir%\lockfiles\dofillupcmd.lock
    {
        SendInput, t^a{Backspace}/fillup{ENTER}
        FileDelete, %A_WorkingDir%\lockfiles\dofillupcmd.lock
    }

    IfExist, %A_WorkingDir%\lockfiles\doyocmd.lock
    {
        SendInput, tyo{ENTER}
        FileDelete, %A_WorkingDir%\lockfiles\doyocmd.lock
    }

    IfExist, %A_WorkingDir%\lockfiles\dofillupreleasecmd.lock
    {
        SendInput, t/fillup{ENTER}
        SendInput, t/engine{ENTER}
        FileDelete, %A_WorkingDir%\lockfiles\dofillupreleasecmd.lock
    }

    IfExist, %A_WorkingDir%\lockfiles\paytoll.lock
    {
        SendInput, t^a{Backspace}/paytoll{ENTER}
        FileDelete, %A_WorkingDir%\lockfiles\paytoll.lock
    }

    IfExist, %A_WorkingDir%\lockfiles\reloadahk.lock
    {
        Reload
        FileDelete, %A_WorkingDir%\lockfiles\reloadahk.lock
    }

    FileRead, Contents, %A_WorkingDir%\lockfiles\sendmsg.lock
    if not ErrorLevel  ; Successfully loaded.
    {
        FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\sendmsgtriggered.lock
        Loop, parse, Contents, `n
        {
            SendInput, %A_LoopField%
        }
        ;MsgBox, yo
        FileDelete, %A_WorkingDir%\lockfiles\sendmsg.lock
    }

    ;IfExist, %A_WorkingDir%\lockfiles\sendmsg.lock
    ;{
    ;  Loop, read, %A_WorkingDir%\lockfiles\sendmsg.lock
    ;  { 
    ;    SendInput, %A_LoopReadLine%
    ;    Sleep, 50
    ;  }
    ;
    ;  FileDelete, %A_WorkingDir%\lockfiles\sendmsg.lock
    ;}
return

#IfWinActive, GTA:SA:MP

^!b::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_ALTBCTRL.lock
return
!e::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_ALTE.lock
return
!r::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_ALTR.lock
return
!1::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_1ALT.lock
return
!2::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_2ALT.lock
return
!3::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_3ALT.lock
return
!4::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_4ALT.lock
return
!6::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_6ALT.lock
return
^!a::
	FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\hotkey_AALTCTRL.lock
return