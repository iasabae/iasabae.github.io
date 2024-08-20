document.addEventListener('DOMContentLoaded', async () => {
  // Google AI 라이브러리가 로드될 때까지 기다립니다
  while (typeof window.GoogleGenerativeAI === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const API_KEY = 'AIzaSyCjS8YzQgIqdGvV0cmhvdyd8hqONUhTek4'; // 실제 API 키로 교체하세요
  const genAI = new window.GoogleGenerativeAI(API_KEY);

  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const resultDiv = document.getElementById('result');

  uploadArea.addEventListener('click', (e) => {
    if (e.target === uploadArea) {
      fileInput.click();
    }
  });

  uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Drag over');
  });

  uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('File dropped');
      handleDrop(e);
  });

  fileInput.addEventListener('change', handleFileSelect);

  function handleDrop(e) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
          processImage(file);
      }
  }

  function handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
          processImage(file);
      }
  }

  async function processImage(file) {
    console.log('Processing image:', file.name);
    try {
        if (window.Swal) {
            window.Swal.fire({
                title: '분석 중...',
                text: '당신의 전생을 찾고 있습니다.',
                allowOutsideClick: false,
                didOpen: () => {
                    window.Swal.showLoading();
                }
            });
        } else {
            console.log('분석 중... 당신의 전생을 찾고 있습니다.');
        }

        const imageData = await fileToBase64(file);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `당신은 재미있고 창의적인 '가상 전생 찾기' 게임의 진행자입니다. 업로드된 현대인의 사진을 보고, 그 사람과 닮았거나 비슷한 특징을 가진 역사적 인물을 자유롭게 상상해서 매칭해주세요. 과학적 증거나 정확성은 중요하지 않습니다. 재미있고 긍정적인 상상력을 발휘해주세요. 다음 형식으로 답변해주세요. 반드시 양식에 맞게 빠짐없이 답변을 하세요.:

1. 역사적 인물의 이름
2. 역사적 인물에 대한 간단한 설명 (100자 이내)
3. 이 역사적 인물과 현대인을 연결 짓는 재미있는 특징이나 이유 (50자 이내)
4. 이 '가상 전생'을 가진 사람에게 주는 재미있고 긍정적인 조언 (100자 이내) 긍정적인 삶을 살아갈 수 있도록 응원하는 메세지를 담아주세요. 너무 짧게 응답하지는 말아주세요.`;

        const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: "image/jpeg" } }]);
        const response = await result.response;
        const text = await response.text();

        if (window.Swal) {
            window.Swal.close();
        }

        // 응답 텍스트를 줄 단위로 나누고, 원하는 정보를 추출
        const lines = text.split('\n');
        let name = '알 수 없음';
        let description = '알 수 없음';
        let connection = '알 수 없음';
        let advice = '알 수 없음';

        lines.forEach(line => {
            if (line.startsWith("1. ")) {
                name = line.replace("1. ", "").trim();
            } else if (line.startsWith("2. ")) {
                description = line.replace("2. ", "").trim();
            } else if (line.startsWith("3. ")) {
                connection = line.replace("3. ", "").trim();
            } else if (line.startsWith("4. ")) {
                advice = line.replace("4. ", "").trim();
            }
        });

        resultDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5>당신의 현재 모습</h5>
                    <img src="${URL.createObjectURL(file)}" class="img-fluid" alt="현재 모습">
                </div>
                <div class="col-md-6">
                    <h5>당신과 닮은 역사적 인물</h5>
                    <p>${name}</p>
                    <h5>역사적 인물 설명</h5>
                    <p>${description}</p>
                    <h5>당신과의 연결고리</h5>
                    <p>${connection}</p>
                    <h5>당신을 위한 조언</h5>
                    <p>${advice}</p>
                    <h5>AI응답 전체</h5>
                    <p>${text}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Detailed error:', error);
        if (window.Swal) {
            window.Swal.fire('오류', `이미지 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
        } else {
            console.error('오류: 이미지 처리 중 오류가 발생했습니다:', error.message);
        }
    }
}


  function fileToBase64(file) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  }

  console.log('페이지가 로드되었습니다. 파일 업로드 기능이 준비되었습니다.');
});
