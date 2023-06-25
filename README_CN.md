中文 / [English](https://github.com/xhash-com/xhash-auto-staking-client)

# xhash-auto-staking-client

xhash-auto-staking-client是[XHash](https://www.xhash.com)在以太坊官方推薦的驗證者密鑰對生成器 [Wagyu Key Gen](https://github.com/stake-house/wagyu-key-gen) 基礎上開發的eth快速質押程序。

通過該程序，用戶可以一站式生成驗證者祕鑰對，完成質押存款，上傳keystore文件到XHash，開啓質押。

[使用說明](https://docs.xhash.com/v/cn/staking/zhi-ya-yi-tai-fang/jian-yi-mo-shi) 。

## 支持錢包
xhash-auto-staking-client通過WalletConnect協議連接錢包，完成質押存款。以下錢包是XHash測試通過的。

| 錢包      | 
| ----------- |
| MateMask    |
| imToken     |
| Rainbow     |
| Argent      |
| Pillar      |
| Omni        |
| TokenPocket |
| BitPay      |
| MathWallet  |
| Ellipal     |
| Trust Wallet|

## 环境配置和依赖项
在運行xhash-auto- stake -client之前，需要安裝一些依賴項。

### Windows 10
- 從https://nodejs.org/en/download/ 下載並安裝Node.js和npm(使用LTS版本和64位。msi安裝程序)。
    - 在 *Tools for Native Modules* 頁面，選中 *Automatically install the necessary tools.* 選項. 將會安裝 chocolatey, Python 3 and VS build tools。安裝指示安裝到結束。
- 以管理員身份打開命令提示窗口 (按 `⊞ Win`+`R`, 鍵入 `cmd`, 按住 `Ctrl` + `Shift` 並按 `↵ Enter`)
    -  執行該命令，安裝git。按照屏幕上的說明操作。
```console
choco install git.install
```
- 打開一個普通的命令提示窗口 (按 `⊞ Win`+`R`, 鍵入 `cmd` 並按 `↵ Enter`).
    - 執行這些命令進行升級 pip, 安裝 pyinstaller, Cython, 安裝 yarn, 克隆存儲庫並安裝所需的包。克隆存儲庫並安裝所需的包。

```console
python -m pip install --upgrade --user pip
python -m pip install --user pyinstaller
python -m pip install --user Cython
set PATH=%APPDATA%\python\Python310\Scripts;%PATH%

npm install -g yarn

git clone https://github.com/xhash-com/xhash-auto-staking-client
cd xhash-auto-staking-client

yarn install
yarn buildcliwin
```

### Ubuntu 20.04 and later
在終端中執行所有這些命令來設置開發環境。

```console
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

sudo apt install -y build-essential nodejs git python3-distutils python3-dev

PATH="$HOME/.local/bin:$PATH"

curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
pip3 install pyinstaller

sudo npm install -g yarn

git clone https://github.com/xhash-com/xhash-auto-staking-client
cd xhash-auto-staking-client

yarn install
yarn buildcli
```

### macOS 10.15.1 and later

在終端中執行所有這些命令來設置開發環境。有時可能會提示安裝“命令行開發人員工具”，請安裝。

```console
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/wagyu/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

git --version

// If git is not found, run the following
brew install git

python3 --version
pip3 --version

// If either python3 or pip3 are not found, run the following
brew install python3

brew install node
pip3 install pyinstaller
npm install -g yarn

git clone https://github.com/xhash-com/xhash-auto-staking-client
cd xhash-auto-staking-client

yarn install
yarn buildcli
```

## 啟動 xhash-auto-staking-client

在 [WalletConnect](https://cloud.walletconnect.com/) 上創建您的 ProjectId 並在 `src/electron/WalletApi.ts`
中使用您自己的替換 `clientInitOptions.projectId`。

在存儲庫目錄下執行以下命令:

- `yarn build`
  - `yarn build:watch` (will reload build on changes)
  - _In order to get them to show in the app press `ctrl+r` or `cmd+r` once the app is started._
- `yarn start`

## 開發者工具運行診斷

使用 `Ctrl` + `Shift` + `I` 打開開發者工具

## 打包
我們使用[electron-builder](https://www.electron.build/) 爲xhash-auto-staking-client創建可執行包。運行以下命令創建:
- `yarn run build`
- `yarn run buildcli` (or `yarn run buildcliwin` on Windows)
- `yarn run dist`

您的可執行包將在' dist/ '文件夾中。

## License
[GPL](LICENSE)
