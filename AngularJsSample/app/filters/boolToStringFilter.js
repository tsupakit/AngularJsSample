app.filter('boolToString', function () {
    return function (value, trueString, falseString) {
        return value ? trueString : falseString;
    };
});