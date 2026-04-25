document.getElementById('evalBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value.trim();
  
  if (!url) {
    showError('URL을 입력해주세요');
    return;
  }
  
  // URL 검증
  try {
    new URL(url);
  } catch {
    showError('올바른 URL 형식이 아닙니다');
    return;
  }
  
  showLoading(true);
  hideError();
  hideResults();
  
  try {
    const results = await analyzeWebsite(url);
    displayResults(results);
  } catch (error) {
    showError(error.message || '평가 중 오류가 발생했습니다');
  } finally {
    showLoading(false);
  }
});

async function analyzeWebsite(url) {
  return new Promise((resolve, reject) => {
    // iframe에서 웹사이트 로드 및 분석
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    
    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const results = evaluateWebsite(doc, url);
        document.body.removeChild(iframe);
        resolve(results);
      } catch (error) {
        document.body.removeChild(iframe);
        reject(new Error('웹사이트 분석 실패'));
      }
    };
    
    iframe.onerror = () => {
      document.body.removeChild(iframe);
      reject(new Error('웹사이트를 로드할 수 없습니다'));
    };
    
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
        reject(new Error('웹사이트 로딩 시간 초과'));
      }
    }, 10000);
    
    document.body.appendChild(iframe);
  });
}

function evaluateWebsite(doc, url) {
  const scores = {
    visual: calculateVisualAppeal(doc),
    retention: calculateRetentionPotential(doc),
    mobile: calculateMobileResponsiveness(doc),
    speed: calculateLoadSpeed(doc),
    trust: calculateTrustSignals(doc)
  };
  
  const overall = Math.round((scores.visual + scores.retention + scores.mobile + scores.speed + scores.trust) / 5);
  
  return {
    url,
    scores,
    overall,
    analysis: generateAnalysis(scores, doc)
  };
}

function calculateVisualAppeal(doc) {
  let score = 5;
  
  // 색상 분석
  const styles = doc.defaultView.getComputedStyle(doc.body);
  const bgColor = styles.backgroundColor;
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    score += 1;
  }
  
  // 이미지 수
  const images = doc.querySelectorAll('img').length;
  score += Math.min(images / 5, 2);
  
  // 레이아웃 구조
  const sections = doc.querySelectorAll('section, article, .container, [class*="section"]').length;
  score += Math.min(sections / 3, 2);
  
  return Math.min(Math.round(score * 10) / 10, 10);
}

function calculateRetentionPotential(doc) {
  let score = 5;
  
  // CTA 버튼 수
  const buttons = doc.querySelectorAll('button, a[class*="btn"], input[type="button"]').length;
  score += Math.min(buttons / 2, 2);
  
  // 헤딩 구조 (좋은 콘텐츠 구조)
  const headings = doc.querySelectorAll('h1, h2, h3').length;
  score += Math.min(headings / 3, 2);
  
  // 텍스트 콘텐츠
  const textLength = doc.body.innerText.length;
  score += textLength > 1000 ? 2 : textLength > 500 ? 1 : 0;
  
  // 내부 링크
  const links = doc.querySelectorAll('a[href*="/"]').length;
  score += Math.min(links / 5, 1);
  
  return Math.min(Math.round(score * 10) / 10, 10);
}

function calculateMobileResponsiveness(doc) {
  let score = 5;
  
  // viewport 메타 태그
  const viewport = doc.querySelector('meta[name="viewport"]');
  score += viewport ? 3 : 0;
  
  // 반응형 이미지
  const responsiveImages = doc.querySelectorAll('img[srcset], img[sizes]').length;
  score += responsiveImages > 0 ? 1 : 0;
  
  // 미디어 쿼리 (간접적으로 확인)
  const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]').length;
  score += stylesheets > 0 ? 1 : 0;
  
  return Math.min(Math.round(score * 10) / 10, 10);
}

function calculateLoadSpeed(doc) {
  let score = 5;
  
  // 스크립트 수 (적을수록 좋음)
  const scripts = doc.querySelectorAll('script').length;
  score -= Math.min(scripts / 10, 3);
  
  // 이미지 최적화 (WebP 사용)
  const webpImages = doc.querySelectorAll('img[src*=".webp"], source[type="image/webp"]').length;
  score += webpImages > 0 ? 2 : 0;
  
  // 지연 로딩
  const lazyImages = doc.querySelectorAll('img[loading="lazy"]').length;
  score += lazyImages > 0 ? 2 : 0;
  
  return Math.min(Math.max(Math.round(score * 10) / 10, 2), 10);
}

function calculateTrustSignals(doc) {
  let score = 5;
  
  // SSL/HTTPS (문서의 location 확인)
  const url = new URL(doc.URL);
  score += url.protocol === 'https:' ? 2 : 0;
  
  // About/Contact 페이지 링크
  const aboutContact = doc.innerText.toLowerCase().match(/(about|contact|privacy|terms|copyright)/g) || [];
  score += aboutContact.length > 0 ? 1.5 : 0;
  
  // 소셜 미디어 링크
  const socialLinks = doc.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]').length;
  score += socialLinks > 0 ? 1.5 : 0;
  
  return Math.min(Math.round(score * 10) / 10, 10);
}

function generateAnalysis(scores, doc) {
  const analyses = [];
  
  if (scores.visual >= 8) {
    analyses.push('✨ 시각적으로 매우 매력적인 디자인입니다.');
  } else if (scores.visual >= 6) {
    analyses.push('🎨 시각적 디자인이 양호합니다.');
  } else {
    analyses.push('📐 시각적 개선이 필요합니다.');
  }
  
  if (scores.retention >= 8) {
    analyses.push('🎯 방문자를 충분히 붙잡을 수 있는 구조입니다.');
  } else if (scores.retention >= 6) {
    analyses.push('📍 방문자 체류도를 개선할 여지가 있습니다.');
  } else {
    analyses.push('⚠️ 방문자 체류도 개선이 시급합니다.');
  }
  
  if (scores.mobile >= 8) {
    analyses.push('📱 우수한 모바일 반응성입니다.');
  } else if (scores.mobile >= 6) {
    analyses.push('📲 모바일 최적화가 필요합니다.');
  }
  
  if (scores.speed >= 8) {
    analyses.push('⚡ 빠른 로딩 속도를 유지합니다.');
  } else if (scores.speed >= 6) {
    analyses.push('🐢 로딩 속도 개선을 권장합니다.');
  }
  
  if (scores.trust >= 8) {
    analyses.push('🔒 높은 신뢰도를 갖춘 사이트입니다.');
  } else if (scores.trust >= 6) {
    analyses.push('🔐 신뢰도 신호를 강화하세요.');
  }
  
  return analyses.join('\n');
}

function displayResults(results) {
  document.getElementById('overallScore').textContent = `${results.overall}/10`;
  
  document.getElementById('visualScore').textContent = results.scores.visual;
  document.getElementById('visualFill').style.width = (results.scores.visual * 10) + '%';
  
  document.getElementById('retentionScore').textContent = results.scores.retention;
  document.getElementById('retentionFill').style.width = (results.scores.retention * 10) + '%';
  
  document.getElementById('mobileScore').textContent = results.scores.mobile;
  document.getElementById('mobileFill').style.width = (results.scores.mobile * 10) + '%';
  
  document.getElementById('speedScore').textContent = results.scores.speed;
  document.getElementById('speedFill').style.width = (results.scores.speed * 10) + '%';
  
  document.getElementById('trustScore').textContent = results.scores.trust;
  document.getElementById('trustFill').style.width = (results.scores.trust * 10) + '%';
  
  document.getElementById('analysisText').textContent = results.analysis;
  
  document.getElementById('results').classList.add('show');
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  document.getElementById('evalBtn').disabled = show;
}

function showError(msg) {
  const error = document.getElementById('errorMsg');
  error.textContent = msg;
  error.classList.add('show');
}

function hideError() {
  document.getElementById('errorMsg').classList.remove('show');
}

function hideResults() {
  document.getElementById('results').classList.remove('show');
}
