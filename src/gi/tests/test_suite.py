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


class SeleniumTestException(Exception):
    def __init__(self, message):
        super(Exception, self).__init__(message)


@pytest.fixture(scope='session')
def driver(request):
    driver = webdriver.Remote(desired_capabilities=DesiredCapabilities.FIREFOX,
                              command_executor=SELENIUM_URL)
    driver.wait = WebDriverWait(driver, 20)
    driver.long_wait = WebDriverWait(driver, 60)
    yield driver
    print('teardown driver')
    driver.close()


class TestSuite:

    def test_001_login(self, driver):
        driver.get('{}/login'.format(BASE_URL))

        driver.find_element_by_id('username').send_keys('demo')
        driver.find_element_by_id('password').send_keys('demo')
        driver.find_element_by_class_name('btn-success').click()

    def test_002_bdc_search(self, driver):
        # we are redirected to bdc search page
        # wait until table is populated
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//td[text()="B001"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element containing B001 in text '
                                        '(table content in bdc search page)!')

        # verify that searchbar is ok
        driver.find_element_by_xpath('//div[contains(@class, "react-bs-table-search-form")]//input').send_keys('eus')
        assert len(driver.find_elements_by_xpath('//table/tbody/tr')) == 1

        # change page to bdc create
        driver.find_element_by_class_name('btn-success').click()

    def test_003_bdc_create(self, driver):
        # we are redirected to bdc create page
        try:
            # wait until login field is present (the page have successfully changed if its the case)
            driver.long_wait.until(ec.presence_of_element_located((By.NAME, 'login')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=login" (login field in bdc create page)!')

        driver.find_element_by_name('login').send_keys('B005')
        driver.find_element_by_name('name').send_keys('B005')

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for bdc create page)!')

        # assert div with class="toast-succes" is present : member change_euro_eusko is OK!
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for bdc create page)!')

        # we are redirected to bdc search page
        # wait until table is populated
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//td[text()="B005"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element containing "B005" in text '
                                        '(table content in bdc search page)!')

        # assert that our new bdc is present in result table
        assert len(driver.find_elements_by_xpath('//td[text()="B005"]')) == 1
        assert len(driver.find_elements_by_xpath('//table[contains(@class, "table-striped")]/tbody/tr')) == 4

    def test_004_delete_bdc(self, driver):
        """
        We are sure that the result table is already populated, see the end of bdc_create test method.
        """

        # click BDC row in table
        driver.find_element_by_xpath('//table[contains(@class, "table-striped")]/tbody/tr[4]').click()

        # click delete bdc link to open modal
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//a[contains(@class, "btn-danger")]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate link "class=btn-danger" '
                                        '(link delete bdc in bdc manager page)!')
        driver.find_element_by_xpath('//a[contains(@class, "btn-danger")]').click()

        try:
            # wait until modal is present and visible
            driver.wait.until(ec.visibility_of_element_located((By.CLASS_NAME, 'modal-footer')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=modal-footer" '
                                        '(modal footer in bdc manager page)!')

        # click delete bdc button to validate modal (we confirm we really want to delete this bdc)
        driver.find_element_by_xpath('//button[contains(@class, "btn-danger")]').click()

        # we are redirected to bdc search page
        # wait until table is populated
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//td[text()="B001"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element containing B001 in text '
                                        '(table content in bdc search page)!')

        assert len(driver.find_elements_by_xpath('//table[contains(@class, "table-striped")]/tbody/tr')) == 3

    def test_005_validate_reconversions(self, driver):
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//a[text()="Opérations à traiter"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate link containing "Opérations à traiter" in text!')

        driver.find_element_by_xpath('//a[text()="Opérations à traiter"]').click()

        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//a[text()="Reconversions"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate link containing "Reconversions" in text!')

        driver.find_element_by_xpath('//a[text()="Reconversions"]').click()

        # wait until table is populated
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH,
                                                              '//td[contains(text(), "Guilde des Mendiants")]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=react-bs-select-all" '
                                        '(toast success confirm for validate_reconversions page)!')

        # select every line in the table
        driver.find_element_by_class_name('react-bs-select-all').click()

        # wait until submit button is clickable
        try:
            driver.wait.until(ec.element_to_be_clickable((By.CLASS_NAME, 'btn-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not click element "class=btn-success" (validate_reconversions page)!')

        # validate form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for member add page)!')

        # assert div with class="toast-succes" is present : member creation is OK!
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member add page)!')

    def test_999_member_change_password(self, driver):
        driver.find_element_by_class_name('dropdown-toggle').click()
        driver.find_element_by_link_text('Changer mon mot de passe').click()

        try:
            driver.wait.until(ec.presence_of_element_located((By.NAME, 'old_password')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=old_password" '
                                        '(old_password field in change password page)!')

        driver.find_element_by_name('old_password').send_keys('demo')
        driver.find_element_by_name('new_password').send_keys('demo1')
        driver.find_element_by_name('confirm_password').send_keys('demo1')

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for member change password page)!')

        # assert div with class="toast-succes" is present : member change_password is OK!
        try:
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member change password page)!')

        # wait until username field is present (the page have successfully changed if its the case)
        try:
            driver.wait.until(ec.presence_of_element_located((By.NAME, 'username')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=username" (username field in member login)!')

        assert '/login' in driver.current_url
