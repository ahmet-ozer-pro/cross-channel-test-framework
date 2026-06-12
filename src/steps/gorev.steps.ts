import { createBdd } from 'playwright-bdd';
import { test } from '../core/fixtures/test-fixtures';
import { userByUsername } from '../support/config/env';
import { newGorevKonu } from '../factories/gorev-factory';
import { Keys } from '../support/store-keys';

/**
 * Görev atama/kontrol step-definition'ları (ADR-0001/0002).
 * Step'ler somut POM'u değil PORT'u (fixture) kullanır; raw locator sızmaz. Senaryo state'i
 * (üretilen Konu) tipli store ile stage-1'den stage-2'ye taşınır.
 */
const { Given, When, Then } = createBdd(test);

Given('go to website', async ({ loginPage }) => {
  await loginPage.goto();
});

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.expectLoginPage();
});

When('I log in as {string}', async ({ loginPage }, username: string) => {
  await loginPage.login(userByUsername(username));
});

When('Gorev Ekle Butonuna Tikla', async ({ gorevForm }) => {
  await gorevForm.openCreate();
});

When('Gorev Konu Alanini Random Doldur', async ({ gorevForm, store }) => {
  const konu = newGorevKonu();
  store.set(Keys.CREATED_GOREV_KONU, konu);
  await gorevForm.fillSubject(konu);
});

When('Gorev Tipi Olarak {string} Sec', async ({ gorevForm }, label: string) => {
  await gorevForm.selectType(label);
});

When('Gorev Oncelik Olarak {string} Sec', async ({ gorevForm }, label: string) => {
  await gorevForm.selectPriority(label);
});

When('Gorev Istenen Teslim Tarihi Olarak Bugunu Sec', async ({ gorevForm }) => {
  await gorevForm.pickDueDateToday();
});

When('Atanan Kullanıcıyı Sec {string}', async ({ gorevForm }, name: string) => {
  await gorevForm.assignTo(name);
});

When('Gorev Kaydet Butonuna Tikla', async ({ gorevForm }) => {
  await gorevForm.submit();
});

Then('Gorev Basari Mesajini Gor', async ({ appShell }) => {
  await appShell.expectSuccessToast();
});

When('I log out from the system', async ({ appShell }) => {
  await appShell.logout();
});

Then('I should see the homepage', async ({ appShell }) => {
  await appShell.expectHome();
});

When('Gorev Listesinde Yeni Gorevi Kontrol Et', async ({ gorevList, store }) => {
  const konu = store.get(Keys.CREATED_GOREV_KONU);
  await gorevList.search(konu);
  await gorevList.expectListed(konu);
});

When(
  'Gorev Durumunu {string} Olarak Guncelle',
  async ({ gorevList, gorevUpdate, store }, status: string) => {
    const konu = store.get(Keys.CREATED_GOREV_KONU);
    await gorevList.open(konu);
    await gorevUpdate.setStatus(status);
    await gorevUpdate.submit();
  },
);
