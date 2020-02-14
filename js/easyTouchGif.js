"use strict";

/*
*  依赖库: touchjs
*  日期: 20190905
*  作者: CHEN MU SHAN
*  功能: 序列帧图片的切换和图片大小缩放
* */

window.easyTouchGif = function (OBJECT,IMAGEARRAY,OPTIONS) {

    var object = OBJECT || null;

    // 图片数组
    var imageArray = IMAGEARRAY || [];

    // 是否可以左右旋转
    var isRotate = OPTIONS.isRotate || true;

    // 是否可以放大缩小
    var isScale = OPTIONS.isScale || true;

    // 最小缩小多少
    var minScale =  OPTIONS.minScale || 0.8;

    // 最大放大多少
    var maxScale =  OPTIONS.maxScale || 1.2;

    // 图片宽
    var imageWidth =  OPTIONS.imageWidth || '10%';

    // 图片高
    var imageHeight =  OPTIONS.imageHeight || '10%';

    // 当图片加载完毕后的回调函数
    var loadingCompleteEvent = OPTIONS.loadingCompleteEvent || null;

    // 是否等待加载完毕后显示(目前只有等待加载完毕后显示)
    var isLoading =  true;

    // 加载显示的元素当加载完毕后会将该元素隐藏
    var loadingElement =  null || typeof OPTIONS.loadingElement  == 'string' ?document.getElementById(OPTIONS.loadingElement):OPTIONS.loadingElement;

    // 当前帧
    var curFrame = 0;
    var fixedFrame = 1;

    // 最大帧
    var maxFrame = imageArray.length - 1;

    // 帧数组
    var frames = [];

    var loadedCount = 0;

    var my = {};

    function init() {

        for (let i = 0; i < imageArray.length; i++) {
            let newImage = new Image();
            newImage.src = imageArray[i];
            frames.push(newImage);
            newImage.onload = imageLoadComplete;
        }
    }

    // 每一张图片加载完毕后的回调
    function imageLoadComplete() {
        loadedCount++;

        // 图片加载完毕
        if (loadedCount >= imageArray.length)
        {

            for( var j = 0; j < frames.length; j++ ) {

                let img =  document.createElement('img');
                img.src = frames[j].src;

                img.style.position = 'absolute';
                img.style.width = imageWidth;
                img.style.height = imageHeight;
                img.style.top = '50%';
                img.style.left = '50%';
                img.οndragstart='return false;'
                let width = parseInt(imageWidth) ;
                let height =  parseInt(imageHeight) ;

                let marginLeft = -width / 2 + imageWidth.replace(width,'');
                let marginTop = -height / 2 + imageHeight.replace(height,'');

                img.style.marginLeft = marginLeft;
                img.style.marginTop = marginTop;

                if (j !== 0)
                    img.style.visibility = 'hidden';
                object.appendChild(img);
                frames[j] = img;
            }

            // 隐藏loadingElement
            if (loadingElement)
            {
                loadingElement.style.visibility = 'hidden';
                loadingElement.style.display = 'none';
            }

            // 完成回调
            if (loadingCompleteEvent)
                loadingCompleteEvent();

            /*      添加监听        */
            touch.on(object,'pinch',onPinch);
            touch.on(object, 'swipestart', onSwipeStart);
            touch.on(object, 'swiping', onSwiping);
        }
    }

    function onPinch(event) {
        if (isScale)
        {
            let scale = 1 * event.scale;
            scale = (scale < minScale ? minScale: scale);
            scale = (scale > maxScale ? maxScale : scale);
            object.style.transform='scale('+ scale + ', ' + scale + ')';
        }
    }

    function onSwipeStart(event) {
        fixedFrame = curFrame;
    }

    function onSwiping(event) {
        if (isRotate)
        {
            if('left' == event.direction || 'right' == event.direction) {
                frames[curFrame].style.visibility = 'hidden';
                var distance = parseInt(event.distance / 10);
                distance = ( 'right' == event.direction ? -distance : distance );
                curFrame = cycle(fixedFrame + distance, maxFrame);
                frames[curFrame].style.visibility = '';
            }
        }
    }

    function cycle(curValue, maxValue) {
        if (curValue < 0) {
            curValue = (-curValue) % maxValue;
            curValue = maxValue - curValue;
        } else if (curValue >= maxValue) {
            curValue = curValue % maxValue;
        }
        return curValue;
    }

    // 跳到某一帧
    this.jump = function jump(index) {
        frames[curFrame].style.visibility = 'hidden';
        curFrame = index;
        frames[curFrame].style.visibility = '';
    };

    // 动画形式跳到某一帧 （目前只支持小从大）
    this.tweenJump = function tweenJump(startIndex,endIndex,interval) {
        frames[curFrame].style.visibility = 'hidden';
        curFrame = startIndex;
        var next = function() {
            nextFrame();
            if (curFrame >= endIndex)
                return;
            setTimeout(next,interval);
        };
        setTimeout(next,interval);
    };

    function nextFrame() {
        curFrame++;
        frames[curFrame-1].style.visibility = 'hidden';
        frames[curFrame].style.visibility = '';
    }

    init();

    return this;
};