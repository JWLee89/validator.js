/**
 * @Author Jay Lee
 * Created on 2018.08.17
 * */
;(function() {

    /***
     * Validator.prototype Constructor 함수
     * @param input Validation 대상 데이터
     * */
    function Validator(input) {
        if (!(this instanceof Validator)) {
            return new Validator(input);
        }
        this.data = input;
        this.isAnd = true; // and 조건으로 판정한다. "or" 로 바꾸면 or || 조건으로 비교.
    }

    // 자주 사요하는 메소드 cache
    var toString = Object.prototype.toString;
    var arrayProto = Array.prototype;
    var concat = arrayProto.concat;
    var slice = arrayProto.slice;
    var isArray = Array.isArray || function(input) {
        return toString.call(input) === "[object Array]";
    };

    /**
     * Polyfills
     * =====================
     * */

    // 간단한 map polyfill. 참고: 아직 테스트 못했음
    if (!Array.prototype.map) {
        Array.prototype.map = function(fn) {
            var result = [];
            for (var i = 0; i < this.length; i++) {
                result.push(fn(this[i], i, this));
            }
            return result;
        };
    }

    /**
     * Private Methods
     * ==============================
     * */

    function isDate(input) {
        return toString.call(input) === "[object Date]";
    }

    function isObject(input) {
        return toString.call(input) === "[object Object]";
    }

    function isString(input) {
        return typeof input === "string";
    }

    function isNumber(input) {
        return typeof input === "number";
    }

    /**
     * 숫자같은 string 을 받으면 true return 한다. 예 "10" ==> true, "ab" ==> false
     * @param {String} str the item to be compared
     * @return {Boolean}
     * */
    function isNumberLike(str) {
        var num = Math.floor(Number(str));
        return String(num) === str && num >= 0;
    };

    /**
     *  Includes all the following characters
     *  ASCII code 32 = space ( Space )
     *  ASCII code 33 = ! ( Exclamation mark )
     *  ASCII code 34 = " ( Double quotes ; Quotation mark ; speech marks )
     *  ASCII code 35 = # ( Number sign )
     *  ASCII code 36 = $ ( Dollar sign )
     *  ASCII code 37 = % ( Percent sign )
     *  ASCII code 38 = & ( Ampersand )
     *  ASCII code 39 = ' ( Single quote or Apostrophe )
     *  ASCII code 40 = ( ( round brackets or parentheses, opening round bracket )
     *  ASCII code 41 = ) ( parentheses or round brackets, closing parentheses )
     *  ASCII code 42 = * ( Asterisk )
     *  ASCII code 43 = + ( Plus sign )
     *  ASCII code 44 = , ( Comma )
     *  ASCII code 45 = - ( Hyphen , minus sign )
     *  ASCII code 46 = . ( Dot, full stop )
     *  ASCII code 47 = / ( Slash , forward slash , fraction bar , division slash )
     *
     *  ASCII code 58 = : ( Colon )
     *  ASCII code 59 = ; ( Semicolon )
     *  ASCII code 60 = < ( Less-than sign )
     *  ASCII code 61 = = ( Equals sign )
     *  ASCII code 62 = > ( Greater-than sign ; Inequality )
     *  ASCII code 63 = ? ( Question mark )
     *  ASCII code 64 = @ ( At sign )
     * */
    function isWordEscapeChar(charCode) {
        return (charCode >= 32 && charCode <= 47) ||
            (charCode >= 58 && charCode <= 64);
    }

    /**
     * 한글인지 체크. Unicode 정보는 아래를 참조하세요.
     * @link http://jrgraphix.net/research/unicode_blocks.php
     * @return {Boolean} 한글문자만 있으면 <code>true</code>
     * */
    function isKoreanChar(character) {
        var c = character.charCodeAt(0);
        return (c >= 0xAC00 && c <= 0xD7A3)
            || (c > 0x3130 && c < 0x318F)
            || (c >= 0x1100 && c <= 0x11FF);
    }


    /**
     * 믄장을 배열로 변환해주는 함수
     *
     * @param input 문자 또는 String word
     * @return {Array} input 에 있는 단어로 구성된 배열
     * */
    function getWords(input) {
        var words = input.split(" ").map(function(word) {
            return word.split("-");
        });
        // Flatten array since it might contain sentences with "-"
        return concat.apply([], words);
    }

    function isAlphabetChar(character) {
        var charCode = character.charCodeAt(0);
        // a-z
        return (charCode >= 97 && charCode <= 122) ||
            // A-Z
            (charCode >= 65 && charCode <= 90);
    }

    function isAlphanumericChar(character) {
        var charCode = character.charCodeAt(0);
        // a-z, A-Z
        return isAlphabetChar(character) ||
            // 0-9
            (charCode >= 48 && charCode <= 57) ||
            // " "
            charCode === 32;
    }

    function isSpace(character) {
        return character.charCodeAt(0) === 32;
    }

    /**
     * 에러처리 부분
     * =================================
     * */

    /**
     * Stack trace 가져오기
     * get stack trace. Used in conjunction with throwError
     * */
    var getStackTrace = function (errMsg) {
        var err = new Error(errMsg);
        return err.stack;
    };

    /**
     * Throw error
     * */
    function throwError(errMsg) {
        throw new Error(getStackTrace(errMsg));
    }

    /**
     * 상세에러 메시지 보여주기. parameter 는 무제한 예. throwDetailedError(obj, " 에러", msg)
     * object 를 에러 메시지에 보여줄래면, string concatentation 안하고 별도의 parameter 로 pass 하세요.
     * Throw detailed error
     * */
    function throwDetailedError() {
        throw new Error(formattedLogString(slice.call(arguments)));
    }

    /**
     * Format objects printed onto the console in a string
     * so that the whole object is displayed properly.
     * */
    function formattedLogString(args) {
        return args.map(printObjFormatted).join('');
    }

    function printObjFormatted(item) {
        return isObject(item) ? JSON.stringify(item) : item || toString.call(item);
    }

    /**
     * 오늘의 시작으로 데이트 설정
     * @param {Date} date 설정할 date 객채
     * */
    function setToStartOfDay(date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    }

    /**
     * 오늘의 마지막 순간으로 데이트 설정
     * @param {Date} date 설정할 date 객채
     * */
    function setToEndOfDay(date) {
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
    }

    /**
     * Date type 처리 함수
     * =========================
     * */

    /**
     * Validation 함수 처리
     * @param {Validator} that
     * @param {function} fn Validation 처리하는 로직
     * */
    function processValidation(that, fn) {
        // 결과가 False 이면 더이상 처리 안함
        if (that.isAnd && that.result === false) {
            return that;
        }
        // or 조건일 경우, 전결과가 true 이면
        // return true
        if (!that.isAnd && that.result === true) {
            return that;
        }
        var result = fn.call(that);
        if (typeof result !== "boolean") {
            throwDetailedError("Result must be of type boolean. Result: ", result
                , " is of type ", toString.call(result));
        }
        that.result = result;
        that.isAnd = true;  // default 는 "and &&" 조건이다
        return that;
    }

    /**
     * String 처리할때 호출하는 함수
     * @param {Validator} that
     * @param {function} fn Validation 처리하는 로직
     * */
    function stringProcessValidation(that, fn) {
        var data = that.data;
        if (!isString(data)) {
            throwDetailedError("Result must be of type 'string'. Result: ", data
                , " is of type ", toString.call(data));
        }
        return processValidation(that, fn);
    }

    /**
     * Number 타입 데이터 처리 함수
     * @param {Validator} that
     * @param {function} fn Validation 처리하는 로직
     * */
    function numberProcessValidation(that, fn) {
        var data = that.data;
        if (!isNumber(data)) {
            throwDetailedError("input must be of type number. Unfortunately, input: "
                , data , " is of type " , toString.call(data));
        }
        return processValidation(that, fn);
    }

    /**
     * Date 타입 데이터 처리 함스
     * @param {Validator} that
     * @param {function} fn Validation 처리하는 로직
     * */
    function dateProcessValidation(that, fn) {
        var data = that.data;
        if (!isDate(data)) {
            throwDetailedError("input must be of type 'Date'. Unfortunately, input: "
                , data , " is of type " , toString.call(data));
        }
        return processValidation(that, fn);
    }

    /**
     * Public API
     * ===============================
     * */

    /**
     * Validation 다 끝나고 호출하는 함수
     * @return {boolean} validation 다 통과했으면 <code>true</code>
     * */
    Validator.prototype.check = function check() {
        if (typeof this.result !== "boolean") {
            throw new Error("Validation results have not been processed. Make sure to run validation once before calling check()");
        }
        return this.result;
    };

    /**
     * 데이터 업데이트. 다른 데이터를 validation 하기 위해서
     * */
    Validator.prototype.setData = function setData(data) {
        this.data = data;
        return this.and();
    };

    /**
     * "or ||" 조건으로 변경
     * */
    Validator.prototype.or = function or() {
        this.isAnd = false;
        return this;
    };

    /**
     * "and &&" 조건으로 변경
     * */
    Validator.prototype.and = function and() {
        this.isAnd = true;
        return this;
    };

    /**
     * Null 값과 유사한 데이터 유형 체크
     * True 나오는값:
     * undefined, false, null, "   ";
     * */
    Validator.prototype.isNullLike = function isNullLike() {
        var data = this.data;
        return processValidation(this, function() {
            return data == null || data.toString().trim() === "" || data === false;
        });
    };

    /**
     * String 값도 입력 가능하다. 예: 2016-06-10 < 2016-06-11 => true
     * @param reference 비교대상 timestamp, date 객채 또는 string 값
     * @return {boolean} input 값이 reference 보다 전이면 <code>true</code>
     * */
    Validator.prototype.isBefore = function isBefore(reference) {
        // We can check if it is a date to be safe, but for the sake of performance, we
        // will just check if they are defined by the user
        if (!reference) {
            throw Error("Reference must be defined");
        }
        var data = this.data;
        return processValidation(this, function() {
            return new Date(data) < new Date(reference);
        });
    };

    /**
     * String 값도 입력 가능하다. 예: 2016-06-12 > 2016-06-10 => true
     * @param reference 비교대상 timestamp, date 객채 또는 string 값
     * @return {boolean} input 값이 reference 보다 미래인 date 값이면 <code>true</code>
     * */
    Validator.prototype.isAfter= function isAfter(reference) {
        // We can check if it is a date to be safe, but for the sake of performance, we
        // will just check if they are defined by the user
        if (!reference) {
            throw Error("Reference must be defined");
        }
        var data = this.data;
        return processValidation(this, function() {
            return new Date(data) > new Date(reference);
        });
    };

    /**
     * 입력받은값이 과거에 있는 날인지 체크
     * @return {boolean} 과거에 있는 날이면 <code>true</code>. 오늘 또는 미래에 있는 날이면 <code>false</code>.
     * */
    Validator.prototype.isBeforeToday = function isBeforeToday() {
        var data = this.data;
        return processValidation(this, function() {
            var today = new Date();
            setToStartOfDay(today);
            return today > new Date(data);
        });
    };

    /**
     * 입력받은값이 미래에 있는 날인지 체크
     * @return {boolean} 미래에 있는 날이면 <code>true</code>. 오늘 또는 과거 있는 날이면 <code>false</code>.
     * */
    Validator.prototype.isAfterToday = function isAfterToday() {
        var data = this.data;
        return processValidation(this, function() {
            var today = new Date();
            setToEndOfDay(today);
            return today < new Date(data);
        });
    };

    Validator.prototype.lessThan = function lessThan(num) {
        var data = this.data;
        return numberProcessValidation(this, function() {
            return data < num;
        });
    };

    Validator.prototype.greaterThan = function greaterThan(num) {
        var data = this.data;
        return numberProcessValidation(this, function() {
            return data < num;
        });
    };

    /**
     * 범위 안의 숫자인지 체크:
     * @param {number} min 하한값
     * @param {number} max 상한값
     * @return {boolean} 범위 내에 있있으면
     * */
    Validator.prototype.isBetween = function isBetween(min, max) {
        var data = this.data;
        return numberProcessValidation(this, function() {
            return min <= data && max >= data;
        });
    };

    /**
     * String 관련된 메소드
     * ==================================
     * */

    /**
     * 간략한 이메일 주소 확인
     * 나중에 정규식으로
     * 유효한 email address 인지 체크
     * */
    Validator.prototype.isValidEmailAddress = function isValidEmailAddress() {
        var email = this.data;
        return stringProcessValidation(this, function() {
            // var emailArr = email.split("@");
            // if (emailArr.length !== 2) {
            //     return false;
            // }
            // var afterAtTextArr = emailArr[1].split(".");
            // // catch empty text/whitespaces before @
            // return afterAtTextArr.length === 2 && emailArr[0].trim().length > 0;
            // 정규식 사용한 철저한 체크
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        });
    };

    /**
     * @param {string} numberFormatStr 유효한 전화번호 양신.
     * 예: xxx-xxxx-xxxx
     * */
    Validator.prototype.isValidPhoneNo = function isValidPhoneNo(numberFormatStr) {
        var phoneNo = this.data;
        return stringProcessValidation(this, function() {
            // 길이다 동일해야 함.
            if (numberFormatStr.length !== phoneNo.length) {
                return false;
            }
            var phoneNoArr = phoneNo.split("-");
            numberFormatStr = numberFormatStr.split("-");
            for (var i = 0; i < numberFormatStr.length; i++) {
                var block = phoneNoArr[i], formatBlock = numberFormatStr[i],
                    blockCharCnt = block.length;
                if (blockCharCnt !== formatBlock.length) {
                    return false;
                }
                // 각 block 에 숮자 있는지 체크
                while(blockCharCnt--) {
                    if (isNumberLike(formatBlock[blockCharCnt])) {
                        if (formatBlock[blockCharCnt] !== block[blockCharCnt]) {
                            return false;
                        }
                    } else if (!isNumberLike(block[blockCharCnt])) {
                        return false;
                    }
                }
            }
            return true;
        });
    };

    Validator.prototype.isEmpty = function isEmpty(input) {
        return processValidation(this, function () {
            return isString(input) && input.trim() === "";
        });
    };

    /**
     * @param {Number} maxSpaceCount String 데이터에 공백이
     * 예: "Captain teemo     on duty! ㅋㅋㅋㅋ"
     * 최대 공백수: 5. isTrimmed(6) => false, isTrimmed(4) => true
     * */
    Validator.prototype.isTrimmed = function isTrimmed(maxSpaceCount) {
        var data = this.data;
        return stringProcessValidation(this, function() {
            maxSpaceCount = maxSpaceCount || 3;
            // Prevent misuse
            if (maxSpaceCount <= 1) {
                throw Error("Max space count must at least be set to two");
            }
            var spaces = [], space = ' ';
            for (var i = 0; i < maxSpaceCount; i++) {
                spaces.push(space);
            }
            // if string is trimmed, should have length of one
            return data.split(spaces.join('')).length === 1;
        });
    };

    /**
     * 공백 체크:
     * 예: hasSpaces("1231233") => false
     * 예: hasSpaces("123123 123123") => true
     * */
    Validator.prototype.hasSpaces = function hasSpaces() {
        var data = this.data;
        return stringProcessValidation(this, function() {
            for (var i = 0; i < data.length; i++) {
                if (isSpace(data[i])) {
                    return true;
                }
            }
            return false;
        });
    };

    /**
     * @param {string|array} words 문자열 또는 문자 type 만 있는 배열
     * 배열일경우, 배열에 있는 문자열 1개라도 있으면 true return 한다
     * */
    Validator.prototype.contains = function contains(words) {
        var data = this.data;
        return stringProcessValidation(this, function() {
            if (isArray(words)) {
                var count = words.length;
                while (count--) {
                    if (data.indexOf(words[count]) !== -1) {
                        return true;
                    }
                }
                return false;
            }
            return data.indexOf(words) !== -1;
        });
    };

    /**
     * @param {string} input. 문장
     * @param {Array} words - blacklist 된 단어들
     * @return {boolean} <code>true</code> words 에 포함된 단어들이 input 에 없으면
     * */
    Validator.prototype.lacks = function lacks(input, words) {
        var wordHandlingArray = [];

        for (var i = 0; i < input.length; i++) {
            var c = input[i], charCode = input.charCodeAt(i);
            // ",", " ", "-", etc. 체크
            if (isWordEscapeChar(charCode)) {
                // Get the current word
                var word = wordHandlingArray.join('').trim().toLowerCase();

                // Compare it to list of blacklisted word
                for (var j = 0; j < words.length; j++) {
                    // To lower case to enforce case insensitivity
                    if (words[j].trim().toLowerCase().indexOf(word) !== -1) {
                        return false;
                    }
                }
                wordHandlingArray = [];
            } else {
                // Add character to array
                wordHandlingArray.push(c);
            }
        }
        return true;
    };

    /**
     * 문자 길이 제한 체크
     * @param {number} n 길이 제한 기준 숮자
     * @return <code>true</code> input 의 길이가 n 보다 작으면 <code>True</code>
     * */
    Validator.prototype.isShorterThan = function isShorterThan(n) {
        var data = this.data;
        return stringProcessValidation(this, function() {
            return data.length <= n;
        });
    };

    /**
     * 문자 길이 초과 체크
     * @param {number} n 길이 초과 기준 숮자
     * @return <code>true</code> input 의 길이가 n 보다 크면 <code>True</code>
     * */
    Validator.prototype.isLongerThan = function isLongerThan(n) {
        return input.length >= n;
    };

    /**
     * @param {number} floorLen word 하한값
     * @param {number} ceilLen 상한값
     * */
    Validator.prototype.isLengthBetween = function isLengthBetween(floorLen, ceilLen) {
        var length = this.data.length;
        return stringProcessValidation(this, function() {
            return length >= floorLen && length <= ceilLen;
        });
    };

    /**
     * @param {number} numberOfWords 단어수
     * 입력한 데이터의 단어수가 입력 받은 count 와 같던가 적으면 <code>true</code>.
     * */
    Validator.prototype.lessWordsThan = function lessWordsThan(numberOfWords) {
        var data = this.data;
        return stringProcessValidation(this, function() {
            return getWords(data).length <= numberOfWords;
        });
    };

    /**
     * @param {number} numberOfWords 단어수
     * 입력한 데이터의 단어수가 입력 받은 count 와 같던가 더 많으면 <code>true</code>.
     * */
    Validator.prototype.moreWordsThan = function moreWordsThan(numberOfWords) {
        var data = this.data;
        return stringProcessValidation(this, function() {
            return getWords(data).length >= numberOfWords;
        });
    };

    /**
     * Checks that the input parameter matches all of the following:
     * 1. input is greater than or equal to the floor parameter
     * 2. input is less than or equal to the ceil parameter.
     *
     * 아래 조건을 판정한다.
     * 1. 데이터가 하한값보다 같던가 크던가
     * 2. 데이터가 상한값보다 같던가 작던가
     *
     * floor <= input <= ceil
     *
     * @param {number} floor 하한값
     * @param {number} ceil 상한값
     * @return {boolean}
     * */
    Validator.prototype.isBetween = function isBetween(floor, ceil) {
        var data = this.data;
        if (!isNumber(floor) || !isNumber(ceil)) {
            throw new Error("Parameters must be numbers");
        }
        return numberProcessValidation(this, function() {
            return data >= floor && data <= ceil;
        });
    };

    /**
     * Check if input is comprised of characters a-z, A-Z, 0-9.
     * */
    Validator.prototype.isAlphanumeric = function isAlphanumeric() {
        return stringProcessValidation(this, function() {
            var data = this.data;
            for (var i = 0; i < data.length; i++) {
                if (!isAlphanumericChar(data[i])) {
                    return false;
                }
            }
            return true;
        });
    };

    Validator.prototype.isKoreanAlphanumeric = function isKoreanAlphanumeric() {
        return stringProcessValidation(this, function() {
            var data = this.data;
            for (var i = 0; i < data.length; i++) {
                if (!isAlphanumericChar(data[i]) && !isKoreanChar(data[i])) {
                    return false;
                }
            }
            return true;
        });
    };

    /**
     * 비밀번호 입력값 체크
     * @param {string} input 입력받은 비밀번호
     * */
    Validator.prototype.checkPassword = function checkPassword(input) {
        // TODO:
    };

    /**
     * 확장자명 확인
     * @param {string} input
     * @param {string} extension. 확장자명. 예: .png.
     * 다수의 확장자를 체크할래면 "|" 문자로 Delimit 하세요.
     * 예: png|jpg|gif
     * @return {Boolean} 유효한 확장자명이면 <code>true</code>
     * */
    Validator.prototype.isValidExtension = function isValidExtension(extension) {
        if (!isString(extension)) {
            throw new Error("Extension must be a string. Input value: " + extension);
        }
        return stringProcessValidation(this, function() {
            var data = this.data;
            var extensions = extension.split("|");
            var extensionPart = data.split(".");

            // "." 이 없으면
            if (extensionPart.length < 2) {
                return false;
            }

            // 마지작 부분이 확장자명이다
            extensionPart = extensionPart[extensionPart.length - 1];
            var isValid = false;
            for (var i = 0; i < extensions.length; i++) {
                var tempExt = extensions[i];
                if (tempExt === extensionPart) {
                    isValid = true;
                    break;
                }
            }
            return isValid;
        });
    };

    // Validator 가 global space 에 존재하지 않으면 추가
    if (!window.Validator) {
        window.Validator = Validator;
        if (!window._v) {
            window._v = Validator;
        }
    } else {
        // 없으면 consumer 에게 알림
        throw new Error("Validator is already defined in the global namespace ...");
    }

})();
