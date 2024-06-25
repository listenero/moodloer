"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = require("selenium-webdriver/chrome");
//Preencher com os dados de login! 
let driver;
const waitPeriod = 10 * 1000; // 10 segundos
const moodleHome = 'https://edisciplinas.usp.br/acessar';
const baseNotasFile = 'baseNotas.pdf';
const linkPdf = 'https://edisciplinas.usp.br/mod/resource/view.php?id=5278701';
const login = 'NUSP';
const password = 'SENHA';
const map2110 = 'https://edisciplinas.usp.br/course/view.php?id=119412';
function clearDownloadsFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadPath = path_1.default.resolve(process.cwd(), 'downloads');
        fs_1.default.readdir(downloadPath, (err, files) => {
            if (err)
                throw err;
            for (const file of files) {
                fs_1.default.unlink(path_1.default.join(downloadPath, file), err => {
                    if (err)
                        throw err;
                });
            }
        });
    });
}
function setupDriver() {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadPath = path_1.default.resolve(process.cwd(), 'downloads');
        const chromeOptions = new chrome_1.Options();
        chromeOptions.setUserPreferences({
            'download.default_directory': downloadPath,
            'download.prompt_for_download': false,
            'download.directory_upgrade': true,
            'plugins.always_open_pdf_externally': true
        });
        driver = new selenium_webdriver_1.Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();
        return driver;
    });
}
function goToMoodleHome() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.get(moodleHome);
    });
}
function clickAcessar() {
    return __awaiter(this, void 0, void 0, function* () {
        const accessButton = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('a.btn-custom')), 10000);
        yield driver.executeScript("arguments[0].click();", accessButton);
    });
}
function typeLogin(login) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInput = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('username')), 10000);
        yield loginInput.sendKeys(login);
    });
}
function typePassword() {
    return __awaiter(this, void 0, void 0, function* () {
        const passwordInput = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('password')), 10000);
        yield passwordInput.sendKeys(password);
    });
}
function clickLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        const loginButton = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.className('btn btn-warning btn-block btn-lg')), 10000);
        yield loginButton.click();
    });
}
function goToMap2110() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.get(map2110);
    });
}
function checkIfPageContainsText(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const pageSource = yield driver.getPageSource();
        return pageSource.includes(text);
    });
}
function getNotasElement2() {
    return __awaiter(this, void 0, void 0, function* () {
        const notasElement = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.className('media-body align-self-center')), 10000);
        const elementText = yield notasElement.getText();
        console.log(elementText);
    });
}
function checkNotasElement() {
    return __awaiter(this, void 0, void 0, function* () {
        const notasElement = yield getElementByHref(linkPdf);
        const notasText = yield notasElement.getText();
        const oldNotasText = 'Notas P1\nArquivo';
        if (notasText !== oldNotasText) {
            throw new Error('Texto do link alterado');
        }
        console.log(notasText);
    });
}
function getElementByHref(href) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const element = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css(`a[href='${href}']`)), 10000);
            return element;
        }
        catch (error) {
            throw new Error(`Link alterado`);
        }
    });
}
function downloadFile(link) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.get(link);
    });
}
function calculateMd5(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fs_1.default.promises.readFile(filePath);
        return (0, crypto_1.createHash)('md5').update(data).digest('hex');
    });
}
function compareFiles(filePath1, filePath2) {
    return __awaiter(this, void 0, void 0, function* () {
        const md5File1 = yield calculateMd5(filePath1);
        const md5File2 = yield calculateMd5(filePath2);
        return md5File1 === md5File2;
    });
}
function getFilesInDownloadsFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadPath = path_1.default.resolve(process.cwd(), 'downloads');
        const files = yield fs_1.default.promises.readdir(downloadPath);
        return files;
    });
}
function checkLoggedIn() {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield checkIfPageContainsText('Arquivos privados'); //só aparece se estiver logado
        if (!exists) {
            throw new Error('Não logado');
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearDownloadsFolder();
        yield setupDriver();
        yield goToMoodleHome();
        yield clickAcessar();
        yield typeLogin(login);
        yield typePassword();
        yield clickLogin();
        yield goToMap2110();
        yield checkLoggedIn();
        yield checkNotasElement();
        yield downloadFile(linkPdf);
        const downloadedFile = 'downloads/' + (yield getFilesInDownloadsFolder())[0];
        const sameFile = yield compareFiles(baseNotasFile, downloadedFile);
        if (!sameFile) {
            throw new Error('Arquivo alterado');
        }
        console.log('Parece que não há nenhuma novidade. Aguardando para verificar novamente...');
        yield driver.quit();
    });
}
function notasChanged() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.get('https://www.youtube.com/watch?v=7wfYIMyS_dI');
        yield driver.sleep(10 * 10 * 10 * 10 * 10);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let continueWork = true;
        while (continueWork) {
            try {
                yield run();
                yield new Promise(r => setTimeout(r, 800000));
            }
            catch (e) {
                switch (e.message) {
                    case 'Texto do link alterado':
                        console.log('Texto do link alterado');
                        continueWork = false;
                        notasChanged();
                        yield driver.quit();
                        break;
                    case 'Link alterado':
                        console.log('Link alterado');
                        continueWork = false;
                        notasChanged();
                        yield driver.quit();
                        break;
                    case 'Arquivo alterado':
                        console.log('Arquivo alterado');
                        continueWork = false;
                        notasChanged();
                        yield driver.quit();
                        break;
                    default:
                        console.log('Erro desconhecido');
                        yield new Promise(r => setTimeout(r, 2000));
                        yield driver.quit();
                        break;
                }
            }
        }
    });
}
main();
