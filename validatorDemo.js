/**
 * 1. 입력값이 NULL 인지 체크
 * */
var nullCheck = _v(undefined).isNullLike();

console.log("Null check: ",  nullCheck.check());  // true
nullCheck.setData(10).isNullLike();
console.log("Null check: ",  nullCheck.check()); // false

var koreanEnglishWord = "hello 안녕하세요ㅇㅗㅎㅇㅁㄴㅁㄴ0ㅇㅁ냐얌뉴얌뉴얌ㄴㅇ";
var valText = _v(koreanEnglishWord).isKoreanAlphanumeric().isLengthBetween(10, 20).check();

console.log(valText);

/**
 * 10. 입력값 전화 번호 형식 체크
 * =================================
 * */
var isValidKoreanMobile = _v("asdasd asdasd").isValidPhoneNo("xxx-xxxx-xxxx");
console.log("is valid phone number: ", isValidKoreanMobile.check());
isValidKoreanMobile = _v("010-1111-1111").isValidPhoneNo("xxx-xxxx-xxxx");
console.log("is valid phone number: ", isValidKoreanMobile.check());
isValidKoreanMobile = _v("999-1111-1111").isValidPhoneNo("010-xxxx-xxxx");
console.log("is valid phone number: ", isValidKoreanMobile.check());

/**
 * 11. 입력값에 공백 포함 여부
 * =================================
 * */
var hasSpaceCheck = _v("asdasd asdasd").hasSpaces();
console.log("has space: ", hasSpaceCheck.check());  // True
hasSpaceCheck.setData("asdasdasdasdasd").and().hasSpaces().or().isValidEmailAddress();
console.log("has space and valid email address: ", hasSpaceCheck.check());  // False


/**
 * 12. 입력값 바이트 길이를 리턴
 * =================================
 * */

/**
 * UTF-8 string 값의 byte length 가져오기
 * @param {string} str
 * */
function lfn_getByteLength(str) {
    var s = str.length;
    for (var i=str.length-1; i>=0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s+=2;  // 한글: 2 bytes
        if (code >= 0xDC00 && code <= 0xDFFF) i--;      //trail surrogate
    }
    return s;
}

console.log(lfn_getByteLength("test하하"));

/**
 * 13. 숫자 체크/ 최소값 / 최대값
 * =================================
 * */
var between80and120 = _v(100).isBetween(80, 120).or().lessThan(130).check();

console.log("Is between 80 and 120: ", between80and120);
/**
 * 16. 입력값이 이메일 형식인지 체크
 * =================================
 * */
var validEmail = _v("test.jpg").isValidEmailAddress();
console.log("Is valid email address: ", validEmail.check());
validEmail = validEmail.setData("ljay189@gmail.com").or().isValidEmailAddress(); // "|| or" operator
console.log("Is valid email address: ", validEmail.check());

/**
 * 17. 확장자 체크
 * =================================
 * */
var imageFileCheck = _v("test.jpg").isValidExtension("jpg|test|png");
console.log("Is valid image: " + imageFileCheck.check());

/**
 * 18. 문자 길이 제한
 * =================================
 * */
var longSentence = "I am an extremely long sentence that knows no end, but I got to end somwhere right? 이젠 한국어로도 작성해볼까요? 앙 몰랑.";

var between100And200 = _v(longSentence).isLengthBetween(10, 200).moreWordsThan(20);
console.log("Length: ", longSentence.length, between100And200.check()); // True.
console.log(between100And200.lessWordsThan(20).check());    // False. 단어수가 20 이상이니까

/**
 * 날짜 영역
 * =================================
 * */
var startOfMonth = new Date();
var today = new Date();
startOfMonth.setDate(1);

var dateVal1 = _v("2016-06-10").isBefore("2016-06-11").isBeforeToday().isAfterToday().check();
var dateVal2 = _v(startOfMonth).isBefore(today).check();

console.log(dateVal1);
console.log(dateVal2);
