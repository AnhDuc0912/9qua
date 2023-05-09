//Đối tượng Validator
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let selectorRules = {};

    //Hàm thực thi validate
    function Validate(inputElement, rule) {
        let errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorElement);
        let errorMassage;
        //Lấy ra từng rule của selector
        let rules = selectorRules[rule.selector];
        //Lặp qua từng rules
        //Nếu có lỗi thì break
        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                    errorMassage = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    );
                    break;

                default:
                    errorMassage = rules[i](inputElement.value);
            }
            if (errorMassage)
                break;
        }

        if (errorMassage) {
            errorElement.innerText = errorMassage;
            getParent(inputElement, options.formGroup).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroup).classList.remove('invalid');
        }
        return errorMassage;
    }
    //lấy element của form cần validate
    let formElement = document.querySelector(options.form);
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();

            let isFormValid = false;
            let isValid;

            //Lặp qua tất cả rule và validate
            options.rules.forEach(function (rule) {
                let inputElement = formElement.querySelector(rule.selector);
                isValid = Validate(inputElement, rule);

                if (isValid) {
                    isFormValid = true;
                }
            });


            if (!isFormValid) {
                if (typeof options.onsubmit === 'function') {
                    let enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                if (input.matches(':checked')) {
                                    values[input.name] = formElement.querySelector('input[name="gender"]').value;
                                }
                                break;

                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});

                    options.onsubmit(formValues);
                }
            }
        }
        //Lắng nghe sự kiện
        options.rules.forEach(function (rule) {

            //Lưu lại các rule của mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            let inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                //    //Xử lý trường hợp khi người dùng blur
                inputElement.onblur = function () {
                    Validate(inputElement, rule);
                }
                //Xử lý trường hợp khi người dùng nhập input
                inputElement.oninput = function () {
                    let errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorElement);

                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroup).classList.remove('invalid');
                }
            });

        });

    }
}

//Định nghĩa rules
//Nguyên tắc của các rules
//1. Qua validate thì hiển thị massage
//2. Không vượt qua validate thì hiện undefined
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            let regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            return regex.test(value) ? undefined : message || 'Trường này là email';
        }
    };
}
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Mật khẩu phải tối thiểu ${min} ký tự`;
        }
    }
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        getConfirmValue,
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || `Mật khẩu không trùng khớp`;
        }
    }
}