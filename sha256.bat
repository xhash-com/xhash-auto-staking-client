for /r %%f in (.\dist\1.2.0\*) do (
    certutil -hashfile "%%f" SHA256 | findstr /v "SHA256" | findstr /v "CertUtil" | findstr /v "命令成功完成" >> "%%f.sha256"
    echo %%~nxf >> "%%f.sha256"
)
