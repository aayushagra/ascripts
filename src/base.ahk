#SingleInstance ignore

FileRemoveDir, %A_WorkingDir%\lockfiles, 1
FileCreateDir, %A_WorkingDir%\lockfiles

#Persistent
SetTimer, CloseMailWarnings, 50
return

sampactive := 0

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

    IfWinActive GTA:SA:MP
    {
        if (sampactive = 0)
        {
            sampactive := 1
            FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\sampactive.lock
            FileDelete, %A_WorkingDir%\lockfiles\sampinactive.lock
        }
    }

    IfWinNotActive GTA:SA:MP
    {
        if (sampactive = 1)
        {
            sampactive := 0
            FileAppend, This is a blank line`n, %A_WorkingDir%\lockfiles\sampinactive.lock
            FileDelete, %A_WorkingDir%\lockfiles\sampactive.lock
        }
    }
return

#IfWinActive, GTA:SA:MP
