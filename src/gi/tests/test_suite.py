import logging

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait

log = logging.getLogger()

SELENIUM_URL = 'http://eusko_selenium:4444/wd/hub'
BASE_URL = 'http://gi:8000'


@pytest.fixture(scope='session')
def driver(request):
    driver = webdriver.Remote(desired_capabilities=DesiredCapabilities.FIREFOX,
                              command_executor=SELENIUM_URL)
    driver.wait = WebDriverWait(driver, 20)
    driver.long_wait = WebDriverWait(driver, 60)
    yield driver
    print("teardown driver")
    driver.close()


class TestSuite:

    def test_1_login(self, driver):
        driver.get('{}/login'.format(BASE_URL))

        driver.find_element_by_id('username').send_keys('demo')
        driver.find_element_by_id('password').send_keys('demo')
        driver.find_element_by_class_name('btn-success').click()

    def test_2_bdc_search(self, driver):
        try:
            # wait until table is present
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'table')))
        except:
            driver.close()
            assert False, 'Could not locate element "class=table" (table in bdc search page)!'

        # change page to bdc create
        driver.find_element_by_class_name('btn-success').click()

    def test_3_bdc_create(self, driver):
        try:
            # wait until login field is present (the page have successfully changed if its the case)
            driver.long_wait.until(ec.presence_of_element_located((By.NAME, 'login')))
        except:
            driver.close()
            assert False, 'Could not locate element "name=login" (login field in bdc create page)!'

        driver.find_element_by_name('login').send_keys('B004')
        driver.find_element_by_name('name').send_keys('B004')

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            assert False, 'Could not locate element "id=toast-container" (toast parent div for member change password page)!'  # noqa

        # assert div with class="toast-succes" is present : member change_euro_eusko is OK!
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            assert False, 'Could not locate element "class=toast-success" (toast success confirm for member change password page)!'  # noqa

    def test_9zzz_member_logout(self, driver):
        try:
            # wait until table is present
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'table')))
        except:
            driver.close()
            assert False, 'Could not locate element "class=table" (table in bdc search page)!'

        driver.find_element_by_class_name('dropdown-toggle').click()
        driver.find_element_by_link_text('Me déconnecter').click()

        # wait until username field is present (the page have successfully changed if its the case)
        try:
            driver.wait.until(ec.presence_of_element_located((By.NAME, 'username')))
        except:
            driver.close()
            assert False, 'Could not locate element "name=username" (username field in member login)!'

        assert '/login' in driver.current_url
