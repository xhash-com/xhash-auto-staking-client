[中文](https://github.com/xhash-com/xhash-auto-staking-client/blob/main/README_CN.md) / English

# xhash-auto-staking-client

xhash-auto-staking-client is a fast staking program developed by XHash for eth2.0 staking on [XHash](https://www.xhash.com)(https://www.xhash.com).
It is modified based on the [Wagyu Key Gen](https://github.com/stake-house/wagyu-key-gen) which is the validators generator recommended by Ethereum.

Through this program, users can generate the validators, complete the deposit, upload the keystore file to XHash in one stop.

[Document](https://docs.xhash.com/staking/staking-for-ethereum/easy-mode) for use.

## Supported Wallet
xhash-auto-staking-client support the wallet which support WalletConnect.Here's what we tested.

| wallet      |
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

## Environment Configuration & Dependencies
Prior to running xhash-auto-staking-client a few dependencies need to be installed.

### Windows 10
- Download and install Node.js and npm from https://nodejs.org/en/download/ (Use LTS version and 64-bit .msi Installer).
    - At the screen named *Tools for Native Modules*, make sure to check the option named *Automatically install the necessary tools.*. It will install chocolatey, Python 3 and VS build tools. Follow the instructions until the end.
- Open a command prompt window as admin (Press `⊞ Win`+`R`, type `cmd`, hold `Ctrl` + `Shift` and press `↵ Enter`)
    -  Execute this command to install git. Follow the instructions on screen.
```console
choco install git.install
```
- Open a normal command prompt window (Press `⊞ Win`+`R`, type `cmd` and press `↵ Enter`).
    - Execute those commands to upgrade pip, install pyinstaller, Cython, install yarn, clone the repository and install the required packages.
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
Execute all those commands in your terminal to setup your dev environment.

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
Execute all those commands in your terminal to setup your dev environment.  You may be prompted to install "command line developer tools" at some point and please do it.

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

## Start xhash-auto-staking-client
Run the following commands in the repository directory:

- `yarn build`
    - `yarn build:watch` (will reload build on changes)
    - _In order to get them to show in the app press `ctrl+r` or `cmd+r` once the app is started._
- `yarn start`

## To run diagnostics
To open dev tools when in XHash Staking Cli use `Ctrl` + `Shift` + `I`

## Bundling
We use [electron-builder](https://www.electron.build/) to create executable bundles for XHash Staking Cli.  Run the following to create a bundle:
- `yarn run build`
- `yarn run buildcli` (or `yarn run buildcliwin` on Windows)
- `yarn run dist`

Your assets will be in the `dist/` folder.

## License
[GPL](LICENSE)
