// fallback of Object.create for older browsers
if (typeof Object.create !== 'function') {

    // defining the same function
    Object.create = function(obj) {

        // calling constructor, cerating object and returning the instance
        function F() {};
        F.prototype = obj;
        return new F();

    };

}

(function($, window, document, undefined) {

    // main function declaration
    $.fn.webcamLightSensor = function(options, onComplete) {

        // appending all required elements to the DOM
        $('body').prepend('<div style="display: none;" id="jquery-light-sensor-wrapper"><video autoplay></video><img id="jquery-light-sensor-temp-img" src=""><canvas></canvas></div>');

        // global vars and elements handlers declaration
        var video = $('#jquery-light-sensor-wrapper').find('video')[0];
        var canvas = $('#jquery-light-sensor-wrapper').find('canvas')[0];
        var ctx = canvas.getContext('2d');
        var localMediaStream = null;

        // main logic
        var lightSensor = {

            init: function(options) {

                var self = this;

                // accept options as object only
                if (typeof(options) == 'object') {

                    // check if developer has set the options
                    self.options = $.extend({}, $.fn.webcamLightSensor.defaults, options);

                } else {
                    self.options = $.fn.webcamLightSensor.defaults; /* set default options if options set is not an object */
                }

                // preparign navigator.getUserMedia_ var as a reference to the all navigator.getUserMedia for all browsers
                navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

                // if navigator and getUserMedia available
                if (!!navigator.getUserMedia_) {

                    navigator.getUserMedia_({
                        video: true
                    }, function(stream) { // success callback

                        try {
                            video.srcObject = stream;
                        } catch (error) {
                            video.src = window.URL.createObjectURL(stream);
                        }

                        localMediaStream = stream;

                    }, function(e) { // error callback

                        console.log('Please allow webcam access to make the plugin function!', e);

                    });

                } else { // older browser navigator not available

                    console.log('Technology doesn\'t support!, please upgrade your browser!');

                }

            },

            startSensor: function(trigger) {

                var self = this;

                // refresh interval between each reading
                setTimeout(function() {

                    // get readings
                    sensor.lightSense();

                    // check if user has set the refresh interval
                    if (self.options.refreshInterval) {

                        self.startSensor();

                    }

                }, trigger || self.options.refreshInterval);

            },

            lightSense: function() {

                // check if video stream is available
                if (localMediaStream) {

                    // draw the video frame on canvas
                    ctx.drawImage(video, 0, 0);

                    // put the image data to the reference image
                    $('#jquery-light-sensor-temp-img').attr('src', canvas.toDataURL('image/webp'));

                    // catch the image source to read the brightness within the image
                    var source = $('#jquery-light-sensor-temp-img').attr('src');

                    // reading image brightness
                    $('#jquery-light-sensor-wrapper img#jquery-light-sensor-temp-img').imageBrightness({

                        reverese: $.fn.webcamLightSensor.defaults.reverseValue // setting up value if brightness or it's reverse value

                    }, function(image, brightness) {

                        //console.log("Brightness: "+brightness);
                        onComplete.call(undefined, brightness);

                    });

                }

            }

        };

        // creating an instance
        var sensor = Object.create(lightSensor);

        // binding the video players play event to start getting required info
        $('#jquery-light-sensor-wrapper video').bind('play', function(e) {
            sensor.startSensor(1);
        });

        // initialize the plugin
        sensor.init(options);

    }

    // keeping the options beyond the scope of the function to make this available for the developer directly
    $.fn.webcamLightSensor.defaults = {

        reverseValue: false, // set reverse true to get contrast value
        refreshInterval: 250, // setting refresh time interval (250 ms default)

    };

})(jQuery, window, document);
