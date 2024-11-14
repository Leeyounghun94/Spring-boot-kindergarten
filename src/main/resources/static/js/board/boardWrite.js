$(document).ready(function() {
    initializeSummernote();
    initializeFileUpload();
    initializeFormSubmit();
});


function initializeSummernote() {
    // Summernote 커스텀 버튼 정의
    var SurveyButton = function(context) {
        var ui = $.summernote.ui;
        
        var button = ui.button({
            contents: '<i class="fas fa-poll"></i> 설문조사',
            tooltip: '설문조사 추가',
            click: function() {
                openSurveyModal();
            }
        });
        
        return button.render();
    };

    $('#summernote').summernote({
        height: 300,
        lang: 'ko-KR',
        sanitize: true,
        disableDragAndDrop: true,
        toolbar: [
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
            ['color', ['forecolor','backcolor']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['picture', 'link', 'video']],
            ['mybutton', ['survey']], // 설문조사 버튼 추가
            ['view', ['fullscreen','help']]
        ],
        fontNames: ['Arial', '맑은 고딕', '궁서', '굴림', '굴림체', '돋움체', 'sans-serif'],
        fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '30', '36'],
        callbacks: {
            onImageUpload: function(files) {
                for(let i = 0; i < files.length; i++) {
                    uploadSummernoteImage(files[i], this);
                }
            }
        },
        // 커스텀 버튼 등록
        buttons: {
            survey: SurveyButton
        }
    });
}

function uploadSummernoteImage(file, editor) {
    const data = new FormData();
    data.append("file", file);

    $.ajax({
        data: data,
        type: "POST",
        url: "/rest/board/uploadImage",
        contentType: false,
        processData: false,
        success: function(data) {
            $(editor).summernote('insertImage', data.url);
        },
        error: function(data) {
            console.log("이미지 업로드 실패");
        }
    });
}

function initializeFileUpload() {
    document.getElementById('boardFile').addEventListener('change', function(e) {
        const files = e.target.files;
        const fileCount = files.length;
        const fileCountDiv = document.getElementById('fileCount');
        fileCountDiv.textContent = `선택된 파일 수: ${fileCount}개`;
    });
}

function initializeFormSubmit() {
    document.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        
        // 설문조사 데이터가 있다면 추가
        if (typeof getSurveyData === 'function') {
            const surveyData = getSurveyData();
            if (surveyData) {
                formData.append('surveyData', JSON.stringify(surveyData));
            }
        }

        try {
            const response = await $.ajax({
                url: this.action,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false
            });

            if (response.success) {
                window.location.href = response.redirectUrl;
            } else {
                window.location.href = '/board/list/common';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('파일 업로드 중 오류가 발생했습니다.');
            window.location.href = '/board/list/common';
        }
    });
}

function openSurveyModal() {
    // Bootstrap 모달 열기
    const surveyModal = new bootstrap.Modal(document.getElementById('surveyModal'));
    surveyModal.show();

}