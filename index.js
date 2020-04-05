var Service, Characteristic;

var rpi433 = require('rpi-433');
var pin;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-433-MHz-button", "Button433MHz", Button433MHz);
};

function Button433MHz(log, config) {
    //config
    this.name = config["name"];
    pin = config["pin"];
    this.code = config["code"];
    if (this.name == undefined || pin == undefined || this.code == undefined) {
        throw "Missing one or more: name, pin, code in config file.";
    }

    //setup
    this.log = log;
    this.service = new Service.StatelessProgrammableSwitch(this.name);
    this.service
        .getCharacteristic(Characteristic.ProgrammableSwitchEvent)
        .setProps({maxValue: 0}); // Single tap only


    this.rfSniffer = rpi433.sniffer({
        pin: pin,
        debounceDelay: 100
    });

    this.rfSniffer.on('data', function (data) {
        console.log('Code received: '+data.code+' pulse length : '+data.pulseLength);
        if(data.code == this.code){
           this.pressed();
        }
    }.bind(this));
}

Button433MHz.prototype.pressed = function() {
    this.log("%s pressed", this.button.name);
    this.service.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(0 /* BUTTON PRESSED EVENT */);
};

Button433MHz.prototype.notify = function(code) {
    if(this.button.codes == code) {
        this.pressed();
    }
};

Button433MHz.prototype.getServices = function() {
    return [this.service];
};