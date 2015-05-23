define("share/all/1.0.0/all", [ "./verify", "jquery" ], function(require) {
    var Verify = require("./verify");
    var v = new Verify("#container");
    v.render();
});

define("share/all/1.0.0/verify", [ "jquery" ], function(require, exports, module) {
    var $ = require("jquery");
    function Verify(container) {
        this.container = $(container);
        this.inputs = this.container.children();
        this.spinnings = [];
    }
    module.exports = Verify;

    Verify.prototype.render = function() {
        this._init();
        this.container.css("background", "none");
        this.inputs.show();
        this._spin();
    };
    Verify.prototype._init = function() {
        var spinnings = this.spinnings;
        $(this.inputs).each(function(n) {
            var startDeg = random(360);
            var node = $(this);
            var timer;
            node.css({
                top: random(40),
                left: n * 50 + random(10),
                zIndex: 1e3
            }).hover(function() {
                node.fadeTo(250, 1).css("zIndex", 1001).css("transform", "rotate(0deg)");
            }, function() {
                node.fadeTo(250, .6).css("zIndex", 1e3);
                timer && clearTimeout(timer);
                timer = setTimeout(spin, Math.ceil(random(1e4)));
            });
            function spin() {
                node.css("transform", "rotate(" + startDeg + "deg)");
            }
            spinnings[n] = spin;
        });
        return this;
    };
    Verify.prototype._spin = function() {
        $(this.spinnings).each(function(i, fn) {
            setTimeout(fn, Math.ceil(random(3e3)));
        });
        return this;
    };
    function random(x) {
        return Math.random() * x;
    }
});
