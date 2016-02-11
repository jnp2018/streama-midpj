'use strict';

streamaApp.directive('streamaVideoPlayer', [
  'uploadService', 'localStorageService', '$timeout',
  function (uploadService, localStorageService, $timeout) {

    return {
      restrict: 'AE',
      templateUrl: 'streama-video-player.htm',
      scope: {
        options: '='
      },

      link: function ($scope, $elem, $attrs) {


        var controlDisplayTimeout;
        var overlayTimeout;
        var volumeChangeTimeout;

        var video = $elem.find('video')[0];
        $elem.addClass('nocursor');

        jQuery($elem).mousewheel(function(event, scroll) {
          event.preventDefault();
          $scope.volumeChanged = true;
          $timeout.cancel(volumeChangeTimeout);
          console.log('%c event', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;', event);
          if(event.deltaY > 0){
            $scope.volumeLevel += 1;
          }else{
            $scope.volumeLevel -= 1;
          }


          console.log('%c event', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;', event.deltaY, $scope.volumeLevel);
          $scope.volumeLevel = $scope.volumeLevel.clamp(0, 10);
          $scope.$apply();

          volumeChangeTimeout = $timeout(function () {
            $scope.volumeChanged = false;
          }, 1500);
        });

        $scope.isMobile = false; //initiate as false
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
          || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))){
          $scope.isMobile = true;
        }

        console.log('%c options', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;', $scope.options);
        $scope.loading = true;
        $scope.initialPlay = false;

        $scope.volumeLevel = localStorageService.get('volumeLevel') || 5;

        video.oncanplay = function () {
          if(!$scope.initialPlay){
            $scope.canplay = true;
            console.log('%c oncanplay', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;');
            $scope.loading = false;
            if(!$scope.isMobile){
              $scope.play();
            }else{
              $scope.pause();
            }
            $scope.videoDuration = video.duration;
            video.currentTime = $scope.options.customStartingTime || 0;
            $scope.currentTime = video.currentTime;
            $scope.initialPlay = true;
            if($scope.options.videoTrack){
              video.textTracks[0].mode = "hidden";
            }
          }
        };

        video.onwaiting = function() {
          $scope.loading = true;
        };

        video.onplaying = function() {
          $scope.loading = false;
        };

        video.onerror = function(){
          if(!video.duration && !$scope.initialPlay){
            $scope.options.onError();
          }
        };

        video.ontimeupdate = function(){
          $scope.currentTime = video.currentTime;
        };

        $scope.toggleSelectEpisodes = function (episodes) {
          $scope.options.selectedEpisodes = episodes;
        };

        $scope.createNewPlayerSession = function () {
          $scope.options.onSocketSessionCreate();
        };

        $scope.toggleTextTrack = function () {
          $scope.isTextTrackVisible = !$scope.isTextTrackVisible;

          if($scope.isTextTrackVisible){
            video.textTracks[0].mode = "showing";
          }else{
            video.textTracks[0].mode = "hidden";
          }
        };

        Mousetrap.bind('space', function() {
          if($scope.playing){
            $scope.pause();
          }else{
            $scope.play();
          }
          $scope.$apply();
        });

        //$scope.controlsVisible = true;
        $scope.showControls = function () {
          $elem.removeClass('nocursor');
          $timeout.cancel(controlDisplayTimeout);
          $timeout.cancel(overlayTimeout);
          $scope.controlsVisible = true;
          $scope.overlayVisible = false;


          controlDisplayTimeout = $timeout(function(){
            $scope.controlsVisible = false;

            if(!$scope.playing){
              overlayTimeout = $timeout(function () {
                if(!$scope.playing){
                  $scope.overlayVisible = true;
                }
              }, 5000);
            }else{
              $elem.addClass('nocursor');
            }

          }, 1000);
        };

        $scope.playerVolumeToggle = function () {
          if($scope.volumeLevel == 0){
            $scope.volumeLevel = 6;
          }else{
            $scope.volumeLevel = 0;
          }
        };

        $scope.scrubberOptions = {
          orientation: 'horizontal',
          min: 0,
          max: 255,
          range: 'min',
          change: function (e, slider) {
          },
          stop: function (e, slider) {
            video.currentTime = slider.value;
            $scope.currentTime = slider.value;
            $scope.options.onTimeChange(slider, $scope.videoDuration);
          }
        };


        var setVolue = function (slider) {
          var volume = slider.value / 10;
          video.volume = volume;
          if($scope.options.rememberVolumeSetting){
            localStorageService.set('volumeLevel', $scope.volumeLevel);
          }
        };

        $scope.play = function (socketData) {
          video.play();
          $scope.playing = true;
          $scope.options.onPlay(video, socketData);
          $scope.overlayVisible = false;
        };


        $scope.pause = function (socketData) {
          video.pause();
          $scope.playing = false;
          $scope.options.onPause(video, socketData);
        };

        $scope.next = $scope.options.onNext;

        $scope.volumeScrubberOptions = {
          orientation: 'vertical',
          range: 'min',
          change: function (e, slider) {
            setVolue(slider);
          },
          slide: function (e, slider) {
            setVolue(slider);
          }
        };

        $scope.closeVideo = function () {
          $scope.options.onClose();
        };

        $scope.clickVideo = function () {
          $scope.options.onVideoClick();
        };

        $scope.fullScreen = function () {
          $scope.isFullScreen = !$scope.isFullScreen;
          var docElm;
          var docElmClose;
          if($scope.isMobile){
            docElm = video;
          }else{
            docElm = document.documentElement;
            docElmClose = document;
          }

          if($scope.isFullScreen){
            if (docElm.requestFullscreen) {
              docElm.requestFullscreen();
            }
            else if (docElm.mozRequestFullScreen) {
              docElm.mozRequestFullScreen();
            }
            else if (docElm.webkitRequestFullScreen) {
              docElm.webkitRequestFullScreen();
            }
            else if (docElm.msRequestFullscreen) {
              docElm.msRequestFullscreen();
            }
          }

          else{
            if (docElmClose.exitFullscreen) {
              docElmClose.exitFullscreen();
            }
            else if (docElmClose.mozCancelFullScreen) {
              docElmClose.mozCancelFullScreen();
            }
            else if (docElmClose.webkitExitFullscreen) {
              docElmClose.webkitExitFullscreen();
            }
            else if (docElmClose.msExitFullscreen) {
              docElmClose.msExitFullscreen();
            }
          }
        };


        $scope.$on('triggerVideoPlay', function (e, data) {
          $scope.play(data);
        });
        $scope.$on('triggerVideoPause', function (e, data) {
          $scope.pause(data);
        });
        $scope.$on('triggerVideoToggle', function (e, data) {
          if($scope.playing){
            $scope.pause(data);
          }else{
            $scope.play(data);
          }
        });
        $scope.$on('triggerVideoTimeChange', function (e, data) {
          video.currentTime = data.currentPlayerTime;
          $scope.currentTime = data.currentPlayerTime;
        });




        $scope.$on('$destroy', function() {
          console.log("destroy");
          video.pause();
          video.src = '';
          $elem.find('video').children('source').prop('src', '');
          $elem.find('video').remove().length = 0;
        });
      }
    }
  }]);
