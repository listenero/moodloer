import path from 'path';
import fs from 'fs';

import playSound from 'play-sound';
import { createHash } from 'crypto';
import { Builder, By, Key, WebDriver, WebElement, until } from 'selenium-webdriver';
import chrome, { Options } from 'selenium-webdriver/chrome';

//Preencher com os dados de login! 
const login = 'NUSP';
const password = 'SENHA';
const waitPeriod = 10 * 1000; // 10 segundos

let driver: WebDriver;
const moodleHome = 'https://edisciplinas.usp.br/acessar';
const baseNotasFile = 'baseNotas.pdf';
const linkNotasPdf = 'https://edisciplinas.usp.br/mod/resource/view.php?id=5278701';
const linkMap2110 = 'https://edisciplinas.usp.br/course/view.php?id=119412';

async function clearDownloadsFolder() {
    const downloadPath = path.resolve(process.cwd(), 'downloads');
    fs.readdir(downloadPath, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(downloadPath, file), err => {
                if (err) throw err;
            });
        }
    });
}

async function setupDriver(): Promise<WebDriver> {
    const downloadPath = path.resolve(process.cwd(), 'downloads');

    const chromeOptions = new Options();
    chromeOptions.setUserPreferences({
        'download.default_directory': downloadPath,
        'download.prompt_for_download': false,
        'download.directory_upgrade': true,
        'plugins.always_open_pdf_externally': true
    });

    driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
    return driver;
}
async function goToMoodleHome() {
    await driver.get(moodleHome);
}

async function clickAcessar(): Promise<void> {
    const accessButton = await driver.wait(until.elementLocated(By.css('a.btn-custom')), 10000);
    await driver.executeScript("arguments[0].click();", accessButton);
}

async function typeLogin() {
    const loginInput = await driver.wait(until.elementLocated(By.id('username')), 10000);
    await loginInput.sendKeys(login);
}

async function typePassword() {
    const passwordInput = await driver.wait(until.elementLocated(By.id('password')), 10000);
    await passwordInput.sendKeys(password);
}

async function clickLogin() {
    const loginButton = await driver.wait(until.elementLocated(By.className('btn btn-warning btn-block btn-lg')), 10000);
    await loginButton.click();
}

async function goToMap2110() {

    await driver.get(linkMap2110);
}

async function checkIfPageContainsText(text: string) {
    const pageSource = await driver.getPageSource();
    return pageSource.includes(text);
}

async function getNotasElement2() {
    const notasElement = await driver.wait(until.elementLocated(By.className('media-body align-self-center')), 10000);
    const elementText = await notasElement.getText();
    console.log(elementText);
}

async function checkNotasElement() {
    const notasElement = await getElementByHref(linkNotasPdf);
    const notasText = await notasElement.getText();
    const oldNotasText = 'Notas P1\nArquivo';
    if (notasText !== oldNotasText) {
        throw new Error('Texto do link alterado');
    }
    console.log(notasText);
}

async function getElementByHref(href: string) {
    try {
        const element = await driver.wait(until.elementLocated(By.css(`a[href='${href}']`)), 10000);
        return element;
    } catch (error) {
        throw new Error(`Link alterado`);
    }
}

async function downloadFile(link: string) {
    await driver.get(link);
}

async function calculateMd5(filePath: string): Promise<string> {
    const data = await fs.promises.readFile(filePath);
    return createHash('md5').update(data).digest('hex');
}

async function compareFiles(filePath1: string, filePath2: string): Promise<boolean> {
    const md5File1 = await calculateMd5(filePath1);
    const md5File2 = await calculateMd5(filePath2);
    return md5File1 === md5File2;
}

async function getFilesInDownloadsFolder() {
    const downloadPath = path.resolve(process.cwd(), 'downloads');
    const files = await fs.promises.readdir(downloadPath);
    return files;
}

async function checkLoggedIn() {
    const exists = await checkIfPageContainsText('Arquivos privados'); //só aparece se estiver logado
    if (!exists) {
        throw new Error('Não logado');
    }
}

async function run() {    
    await clearDownloadsFolder();
    await setupDriver();
    await goToMoodleHome();
    await clickAcessar();
    await typeLogin();
    await typePassword();
    await clickLogin();
    await goToMap2110();
    await checkLoggedIn();
    await checkNotasElement();
    await downloadFile(linkNotasPdf);
    const downloadedFile = 'downloads/' + (await getFilesInDownloadsFolder())[0];
    const sameFile = await compareFiles(baseNotasFile, downloadedFile);
    if (!sameFile) {
        throw new Error('Arquivo alterado');
    }
    console.log('Parece que não há nenhuma novidade. Aguardando para verificar novamente...');
    await driver.quit();
}

async function notasChanged() {
    await driver.get('https://www.youtube.com/watch?v=7wfYIMyS_dI');
    await driver.sleep(10 * 10 * 10 * 10 * 10);
}

async function main() {
    let continueWork = true;
    while (continueWork) {
        try {
            await run();            
            await new Promise(r => setTimeout(r, waitPeriod));
        } catch (e: any) {
            switch (e.message) {
                case 'Texto do link alterado':
                    console.log('Texto do link alterado');
                    continueWork = false;
                    notasChanged();
                    await driver.quit();
                    break;
                case 'Link alterado':
                    console.log('Link alterado');
                    continueWork = false;
                    notasChanged();
                    await driver.quit();
                    break;
                case 'Arquivo alterado':
                    console.log('Arquivo alterado');
                    continueWork = false;
                    notasChanged();
                    await driver.quit();
                    break;
                default:
                    console.log('Erro desconhecido');
                    await new Promise(r => setTimeout(r, 2000));
                    await driver.quit();
                    break;
            }
        }
    }
}


main();

