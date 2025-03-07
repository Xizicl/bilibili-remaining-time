// ==UserScript==
// @name         B站选集剩余时长显示
// @namespace    https://github.com/Xizicl/bilibili-remaining-time
// @version      1.0.0
// @description  在B站视频页面显示从当前选集开始的剩余时长和总时长，并实时更新。
// @author       Xizicl
// @match        *://www.bilibili.com/video/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // 1. 创建显示容器
  const container = document.createElement('div');
  container.id = 'bilibili-remaining-time';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 999999;
    font-size: 14px;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: opacity 0.3s;
    line-height: 1.6;
  `;
  container.innerHTML = '正在加载...';
  document.body.appendChild(container);

  // 2. 格式化时间
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}小时${minutes.toString().padStart(2, '0')}分${secs.toString().padStart(2, '0')}秒`;
  };

  // 3. 计算剩余时长和总时长
  const calculateTime = () => {
    const listItems = document.querySelectorAll('.video-pod__list.multip.list .simple-base-item');
    let remainingTime = 0;
    let totalDuration = 0;
    let foundCurrent = false;

    listItems.forEach((item) => {
      const durationText = item.querySelector('.stat-item.duration')?.textContent?.trim() || '00:00';
      const [minutes, seconds] = durationText.split(':').map(Number);
      const durationInSeconds = minutes * 60 + seconds;
      totalDuration += durationInSeconds;

      const playingGif = item.querySelector('.playing-gif');
      if (playingGif && playingGif.style.display !== 'none') {
        foundCurrent = true;
        const video = document.querySelector('video');
        if (video) {
          remainingTime += durationInSeconds - video.currentTime;
        }
      } else if (foundCurrent) {
        remainingTime += durationInSeconds;
      }
    });

    return { remainingTime, totalDuration };
  };

  // 4. 更新显示内容
  const updateDisplay = () => {
    try {
      const { remainingTime, totalDuration } = calculateTime();
      container.innerHTML = `
        <div style="color: #00a1d6; margin-bottom: 4px;">▶ 剩余时长</div>
        <div style="font-weight: 500;">${formatTime(remainingTime)}</div>
        <div style="margin-top: 8px; opacity: 0.8;">总时长 ${formatTime(totalDuration)}</div>
      `;
    } catch (e) {
      console.error('[剩余时间插件] 错误:', e);
      container.innerHTML = '插件加载失败，请刷新页面重试。';
    }
  };

  // 5. 启动逻辑
  const init = () => {
    const checkElementsLoaded = () => {
      const listItems = document.querySelectorAll('.video-pod__list.multip.list .simple-base-item');
      const video = document.querySelector('video');
      return listItems.length > 0 && video !== null;
    };

    const poll = () => {
      if (checkElementsLoaded()) {
        updateDisplay();
        setInterval(updateDisplay, 1000);
      } else {
        setTimeout(poll, 500);
      }
    };

    poll();
  };

  // 6. 根据页面加载状态启动
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();