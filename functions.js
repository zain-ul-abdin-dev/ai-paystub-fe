
const paystubaiintegration = {
    paystubsAIscrollToElement: function (elm) {
        if (typeof elm === "string") {
            elm = document.getElementById(elm);
        }

        var yPos = 0;
        while (elm) {
            yPos += (elm.offsetTop - elm.scrollTop + elm.clientTop);
            // eslint-disable-next-line no-param-reassign
            elm = elm.offsetParent;
        }

        window.scrollTo({ top: yPos - _.qs(document, '.site-header').clientHeight - 200, left: 0, behavior: 'smooth' });
    },
    choose_paystub_template: function (vars) {
        formManager.setTemplate(vars.template_choice);
    },
    upload_company_logo: function (vars) {
        document.getElementById("logo-upload").click();
        this.paystubsAIscrollToElement("logo-upload");
    },
    open_chat: function (vars) {
        window.lazyLoadFreshchatScript();
    },
    preview_paystubs: function (vars) {
        document.querySelector('.preview-loading__preview-button').click();
    },
    submit_paystub_form: function (vars) {
        document.querySelector(".customize-review__button .form-submit").click();
    },
    set_email_for_paystubs: function (vars) {
        $$("#tps_create_stub_email").val(vars.email);
        this.paystubsAIscrollToElement("tps_create_stub_email");
    },
    add_direct_deposit_slip: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_directDeposit");
        if (vars.add_direct_deposit) {
            if ($$("#tps_create_stub_directDeposit").prop('checked') == false) {
                document.getElementById("tps_create_stub_directDeposit").click();
            }
        } else {
            if ($$("#tps_create_stub_directDeposit").prop('checked') == true) {
                document.getElementById("tps_create_stub_directDeposit").click();
            }
        }
        if (vars.account_number) {
            document.getElementById("tps_create_stub_directDepositInfo_accountNumber").value = vars.account_number;
        }
        if (vars.routing_number) {
            document.getElementById("tps_create_stub_directDepositInfo_routingNumber").value = vars.routing_number;
        }
        if (vars.bank_name) {
            document.getElementById("tps_create_stub_directDepositInfo_bankName").value = vars.bank_name;
        }
    },
    set_paydates: function (vars) {
        this.paystubsAIscrollToElement("paydates-quantity-selector");
        if (vars.number_of_paydates) {
            $$("#paydates-quantity-selector").val(vars.number_of_paydates);
            window.arrayManager.setPayDatesQuantity(vars.number_of_paydates);
            window.htmlManager.syncPayDates();
        }
    },
    set_document_recipient: function (vars) {
        if (vars.document_recipient) {
            this.paystubsAIscrollToElement("tps_create_stub_documentRecipient");
            $$("#tps_create_stub_documentRecipient").val(vars.recipient);
        }
    },
    set_purchase_reason: function (vars) {
        if (vars.reason) {
            this.paystubsAIscrollToElement("tps_create_stub_purchaseReason");
            $$("#tps_create_stub_purchaseReason").val(vars.reason);
        }
    },
    set_latest_paydate: function (vars) {
        if (vars.paydate) {
            this.paystubsAIscrollToElement("tps_create_stub_salaryProfile_payDates_0_payDate");
            $$("#tps_create_stub_salaryProfile_payDates_0_payDate").val("vars.paydate");
            $$("#tps_create_stub_salaryProfile_payDates_0_payDate").trigger("dateChange");
        }
    },
    set_company_name: function (vars) {
        if (vars.company_name) {
            this.paystubsAIscrollToElement("tps_create_stub_companyProfile_name");
            $$("#tps_create_stub_companyProfile_name").val(vars.company_name);
        }
    },
    set_company_phone_number: function (vars) {
        if (vars.phone_number) {
            this.paystubsAIscrollToElement("tps_create_stub_companyProfile_phoneNumber");
            $$("#tps_create_stub_companyProfile_phoneNumber").val(vars.phone_number);
        }
        if (vars.ext_no) {
            $$("#tps_create_stub_companyProfile_phoneNumberExt").val(vars.ext_no);
        }
    },
    set_company_ein: function (vars) {
        if (vars.ein) {
            this.paystubsAIscrollToElement("tps_create_stub_companyProfile_employerIdentificationNumber");
            $$("#tps_create_stub_companyProfile_employerIdentificationNumber").val(vars.ein);
        }
    },
    set_employment_type: function (vars) {
        if (vars.employment_type) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_employmentStatus_0");
            if (vars.employment_type == "employee") {
                document.getElementById("tps_create_stub_employeeProfile_employmentStatus_0").click();
            }
            if (vars.employment_type == "contractor") {
                document.getElementById("tps_create_stub_employeeProfile_employmentStatus_1").click();
            }
        }
    },
    set_employee_or_contractor_name: function (vars) {
        if (vars.full_name) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_name");
            $$("#tps_create_stub_employeeProfile_name").val(vars.full_name);
        }
    },
    set_last_4_digits_of_ssn: function (vars) {
        if (vars.last_4_digits) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_socialSecurityNumber");
            $$("#tps_create_stub_employeeProfile_socialSecurityNumber").val(vars.last_4_digits);
        }
    },
    set_employee_or_contractor_id: function (vars) {
        if (vars.employee_or_contractor_id) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_employeeID");
            $$("#tps_create_stub_employeeProfile_employeeID").val(vars.employee_or_contractor_id);
        }
    },
    set_using_w4_from_2020_and_beyond: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_isW4FormBefore2020");
        if (vars.using_w4_2020_or_later) {
            if ($$("#tps_create_stub_employeeProfile_isW4FormBefore2020").prop('checked') == false) {
                document.getElementById("tps_create_stub_employeeProfile_isW4FormBefore2020").click();
            }
        } else {
            if ($$("#tps_create_stub_employeeProfile_isW4FormBefore2020").prop('checked') == true) {
                document.getElementById("tps_create_stub_employeeProfile_isW4FormBefore2020").click();
            }
        }
    },
    set_dependants_total_amount: function (vars) {
        if (vars.dollar_amount) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_dependentsAmount");
            $$("#tps_create_stub_employeeProfile_dependentsAmount").val(vars.dollar_amount);
        }
    },
    set_other_income_amount: function (vars) {
        if (vars.amount) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_otherIncomeAmount");
            $$("#tps_create_stub_employeeProfile_otherIncomeAmount").val(vars.amount);
        }
    },
    set_deduction_amount: function (vars) {
        if (vars.deduction_amount) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_deductionsAmount");
            $$("#tps_create_stub_employeeProfile_deductionsAmount").val(vars.deduction_amount);
        }
    },
    set_is_employee_working_from_home: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_workFromHome");
        if (vars.is_working_from_home) {
            if ($$("#tps_create_stub_workFromHome").prop('checked') == false) {
                document.getElementById("tps_create_stub_workFromHome").click();
            }
        } else {
            if ($$("#tps_create_stub_workFromHome").prop('checked') == true) {
                document.getElementById("tps_create_stub_workFromHome").click();
            }
        }
    },
    set_working_multiple_jobs: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_hasMultipleJobs");
        if (vars.working_multiple_jobs) {
            if ($$("#tps_create_stub_employeeProfile_hasMultipleJobs").prop('checked') == false) {
                document.getElementById("tps_create_stub_employeeProfile_hasMultipleJobs").click();
            }
        } else {
            if ($$("#tps_create_stub_employeeProfile_hasMultipleJobs").prop('checked') == true) {
                document.getElementById("tps_create_stub_employeeProfile_hasMultipleJobs").click();
            }
        }
    },
    set_federal_filing_status: function (vars) {
        if (vars.filing_status) {
            this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_federalFilingStatus");
            $$("#tps_create_stub_employeeProfile_federalFilingStatus").val(vars.filing_status);
        }
    },
    set_company_address: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_companyProfile_address_streetAddress");
        if (vars.street_address) {
            $$("#tps_create_stub_companyProfile_address_streetAddress").val(vars.street_address);
        }
        if (vars.city) {
            $$("#tps_create_stub_companyProfile_address_city").val(vars.city);
        }
        if (vars.state) {
            $$("#tps_create_stub_companyProfile_address_state").val(vars.state);
        }
        if (vars.zipcode) {
            $$("#tps_create_stub_companyProfile_address_zipCode").val(vars.zipcode);
        }
        if (vars.apt_ste_no) {
            $$("#tps_create_stub_companyProfile_address_apartmentNumber").val(vars.apt_ste_no);
        } else {
            $$("#tps_create_stub_companyProfile_address_apartmentNumber").val("");
        }
    },
    set_employee_contractor_address: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_employeeProfile_address_streetAddress");
        if (vars.street_address) {
            $$("#tps_create_stub_employeeProfile_address_streetAddress").val(vars.street_address);
        }
        if (vars.city) {
            $$("#tps_create_stub_employeeProfile_address_city").val(vars.city);
        }
        if (vars.state) {
            $$("#tps_create_stub_employeeProfile_address_state").val(vars.state);
        }
        if (vars.zipcode) {
            $$("#tps_create_stub_employeeProfile_address_zipCode").val(vars.zipcode);
        }
        if (vars.apt_ste_no) {
            $$("#tps_create_stub_employeeProfile_address_apartmentNumber").val(vars.apt_ste_no);
        } else {
            $$("#tps_create_stub_employeeProfile_address_apartmentNumber").val("");
        }
    },
    set_payment_type: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_salaryProfile_salaryType_0");
        if (vars.payment_type) {
            if (vars.payment_type == "hourly") {
                document.getElementById("tps_create_stub_salaryProfile_salaryType_0").click();
            }
            if (vars.payment_type == "salaried") {
                document.getElementById("tps_create_stub_salaryProfile_salaryType_1").click();
            }
        }
    },
    set_hourly_rate: function (vars) {
        if (vars.hourly_rate) {
            this.paystubsAIscrollToElement("tps_create_stub_salaryProfile_hourlyRate");
            $$("#tps_create_stub_salaryProfile_hourlyRate").val(vars.hourly_rate);
        }
    },
    set_annual_salary: function (vars) {
        if (vars.annual_salary) {
            this.paystubsAIscrollToElement("tps_create_stub_salaryProfile_annualSalary");
            $$("#tps_create_stub_salaryProfile_annualSalary").val(vars.annual_salary);
        }
    },
    set_employee_or_contractor_hire_date: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_salaryProfile_isNewHire");
        if (vars.enabled) {
            if ($$("#tps_create_stub_salaryProfile_isNewHire").prop('checked') == false) {
                document.getElementById("tps_create_stub_salaryProfile_isNewHire").click();
            }
            if (vars.hours_worked_per_pay_period) {
                $$("#tps_create_stub_salaryProfile_employeeStartDate").val(vars.hire_date);
            }
        } else {
            if ($$("#tps_create_stub_salaryProfile_isNewHire").prop('checked') == true) {
                document.getElementById("tps_create_stub_salaryProfile_isNewHire").click();
            }
        }
    },
    set_show_hourly_rate_on_stub: function (vars) {
        this.paystubsAIscrollToElement("tps_create_stub_salaryProfile_showHourlyRate");
        if (vars.enabled) {
            if ($$("#tps_create_stub_salaryProfile_showHourlyRate").prop('checked') == false) {
                document.getElementById("tps_create_stub_salaryProfile_showHourlyRate").click();
            }
            if (vars.hours_worked_per_pay_period) {
                $$("#tps_create_stub_salaryProfile_salaryHoursWorked").val(vars.hours_worked_per_pay_period);
            }
        } else {
            if ($$("#tps_create_stub_salaryProfile_showHourlyRate").prop('checked') == true) {
                document.getElementById("tps_create_stub_salaryProfile_showHourlyRate").click();
            }
        }
    },
    set_pay_frequency: function (vars) {
        if (vars.pay_frequency) {
            this.paystubsAIscrollToElement("tps_create_stub_salaryProfile_payFrequency");
            $$("#tps_create_stub_salaryProfile_payFrequency").val(pay_frequency);
        }
    }
};