/**
 * @description animation library
 * @detail requestAnimationFrame
 * 1. duration
 * 2. from
 * 3. to
 * 4. type 
 */

import Tween from './tween';

let animationId = -1;
let stoppedAnimationId = animationId - 1;

const customAnimation = exports.customAnimation = {}
customAnimation.to = function (duration, from, to, type, delay = 0, complateCallback) {
  for (let prop in to) {
    setTimeout(function(prop) {
      return function () {
        TweenAnimation(from[prop], to[prop], duration, type, (to, isEnd) => {
          from[prop] = to;
          if (isEnd && complateCallback && typeof complateCallback === 'function') {
            complateCallback(to);
          }
        })
      }
    }(prop), delay * 1000)
  }
}

/**
 * 
 * @param {*} from 
 * @param {*} to 
 * @param {*} duration unit second
 * @param {*} type 
 * @param {*} callback 
 */
exports.TweenAnimation = TweenAnimation
function TweenAnimation(from, to, duration, type, callback) {

  const selfAnimationId = ++animationId;

  const options = {
    callback: typeof callback === 'function' ? callback : function() {},
    type: type || 'Linear',
    duration: duration || 300
  }

  const frameCount = options.duration * 1000 / 17
  let start = -1;

  const startTime = Date.now()
  let lastTime = startTime;

  const typeList = options.type.split('.');
  let tweenFn;
  if (typeList.length === 1) {
    tweenFn = Tween[typeList[0]];
  } else if (typeList.length === 2) {
    tweenFn = Tween[typeList[0]][typeList[1]];
  }

  if (!tweenFn) {
    console.log(`${type} has no tween function`);
    return
  }

  const step = function step() {
    const currentTime = Date.now()
    const interval = currentTime - lastTime;
    lastTime = currentTime

    let fps;
    if (interval) {
      fps = Math.ceil(1000 / interval);
    } else {
      requestAnimationFrame(step);
      return 
    }
    if (fps >= 30) {
      start++;
    } else {
      const _start = Math.floor(interval / 17)
      start = start + _start;
    }

    const value = tweenFn(start, from, to - from, frameCount);
    if (start <= frameCount && selfAnimationId > stoppedAnimationId) {
      options.callback(value); // 每帧
      requestAnimationFrame(step)
    } else if (start > frameCount && selfAnimationId > stoppedAnimationId){
      // 动画结束
      options.callback(to, true)
    }
  }

  step()
}

exports.stopAllAnimation = stopAllAnimation 
function stopAllAnimation() {
  stoppedAnimationId = animationId;
}
