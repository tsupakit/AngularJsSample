  
var javaScriptBoundObject = {
    Execute: function (sender, command) {
        if (window.boundObject) {
            console.log(sender + ' ' + command);
            window.boundObject.execute(sender, command);
        } else {
            console.log(sender, command, ",       Error: window.boundObject not found!!");
        }
    },
    OK: function () { this.Execute("DialogResult", "OK"); },
    Cancel: function () { this.Execute("DialogResult", "Cancel"); },
};