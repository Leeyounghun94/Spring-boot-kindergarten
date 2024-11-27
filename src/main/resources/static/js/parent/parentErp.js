// ERP에서 부모 등록할 때 필요한 JavaScript (jQuery 버전)
console.log('스크립트 로드 ::');

// DOM이 완전히 로드된 후 실행되는 초기화 코드
$(document).ready(function() {

    // 폼 제출 이벤트 처리
    $('form').on('submit', function(e) {
        e.preventDefault();


        // Member 정보용 연락처 조합
        const phone1 = $('input[maxlength="3"][required]').val();
        const phone2 = $('input[maxlength="4"][required]').first().val();
        const phone3 = $('input[maxlength="4"][required]').last().val();
        // 3칸으로 나누어진 연락처들을 조합한다.


        if (phone1 && phone2 && phone3) {
            $('[name="phone"]').val(`${phone1}-${phone2}-${phone3}`);
        }// 연락처가 모두 입력된 경우에만 조합하여 hidden 필드에 설정

        // Parent 정보용 비상연락처 조합
        const emergency1 = $('input[placeholder="입력"]').val();
        const emergency2 = $('input[maxlength="4"]:not([required])').first().val();
        const emergency3 = $('input[maxlength="4"]:not([required])').last().val();
        // 3칸으로 나누어진 비상연락처들을 조합한다.


        if (emergency1 && emergency2 && emergency3) {
            const emergencyPhone = `${emergency1}-${emergency2}-${emergency3}`;
            $('[name="childrenEmergencyPhone"]').val(emergencyPhone);
            console.log('비상연락처 설정:', emergencyPhone);  // 로그 추가
        }// 비상연락처가 모두 입력된 경우에만 조합하여 hidden 필드에 설정


        // 폼 데이터 검증
        const email = $('[name="email"]').val();
        if (!email) {
            alert('이메일을 입력해주세요.');
            return;
        }

        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: $(this).serialize(),
            success: function(response) {// AJAX 요청이 성공이 되면?
                console.log('서버 응답:', response);

                if (response.success) {
                    // 모달에 임시 비밀번호 표시
                    $('#tempPasswordDisplay').text(response.tempPassword);
                    $('#emailDisplay').text(email);  // 이메일도 표시

                    var modal = $('#passwordModal');
                    modal.modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                    modal.modal('show');
                    // 모달 표시


                    $('#confirmPassword').one('click', function() {
                        modal.modal('hide');
                        // parentId가 undefined인 경우 처리
                        const parentId = response.parentId || '';
                        if (parentId) {
                            window.location.href = '/erp/children/register?parentId=' + parentId;
                        } else {
                            alert('학부모 ID를 찾을 수 없습니다.');
                            window.location.href = '/erp/parent/list';
                        }
                    });// 확인 버튼 클릭 시 원아 등록페이지로 이동하면서 부모ID도 넘어간다.

                } else {
                    alert(response.error || '등록에 실패했습니다.');
                    // 요청이 실패되면 알럿으로 알려주기
                }
            },// success end
            error: function(xhr, status, error) {
                console.error('에러 상세:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
                alert('서버 오류가 발생했습니다.');
            }// error end

        });// AJAX END
    });// $('form').on('submit', function(e) END

    // 전화번호 입력 필드에 숫자만 입력되도록 제한
    $('input[maxlength]').on('input', function() {
        // 입력된 값에서 숫자가 아닌 문자를 모두 제거
        $(this).val(function(_, value) {
            return value.replace(/[^0-9]/g, '');
        });// $(this) value END
    });//  $('input[maxlength]').on('input', function() END

    // 검색 기능
    window.search = function() {
        const searchType = document.getElementById('searchType').value;
        const keyword = document.getElementById('keyword').value;

        if (!keyword || keyword.trim() === '') {
            alert('검색어를 입력해주세요.');
            return;
        }

        location.href = `/erp/parent/list?searchType=${encodeURIComponent(searchType)}&keyword=${encodeURIComponent(keyword)}`;
    };

    document.addEventListener('DOMContentLoaded', function() {
        const keywordInput = document.getElementById('keyword');
        if (keywordInput) {
            keywordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const keyword = this.value;
                    if (!keyword || keyword.trim() === '') {
                        alert('검색어를 입력해주세요.');
                        return;
                    }
                    search();
                }
            });
        }
    });//  $('input[name="keyword"]').on('keypress', function END

    window.movePage = function (page) {
        // paretnList에서 페이지 번호 클릭 시 실행되는 함수

        if (page < 0) {
            alert("첫 페이지 입니다.");
            return;
        }// if - page END

        const totalPages = $('#totalPages').val();

        if (page >= totalPages) {
            alert("마지막 페이지 입니다.");
            return;
        }// if - totalPages END

        const searchType = $('select[name="searchType"]').val();
        const keyword = $('input[name="keyword"]').val();
        location.href = '/erp/parent/list?page=' + page +
            (searchType ? '&searchType=' + encodeURIComponent(searchType) : '') +
            (keyword ? '&keyword=' + encodeURIComponent(keyword) : '');
    };// window.movePage = function END

    /*<![CDATA[*/
    // Thymeleaf를 통해 parentId를 안전하게 가져옴
    const parentId = /*[[${parent.parentId}]]*/ null;
    window.confirmDelete = function(parentId) {
        console.log('ParentId:', parentId);

        if (!parentId) {
            alert('삭제할 학부모 정보를 찾을 수 없습니다.');
            return;
        }

        if (confirm('정말 삭제하시겠습니까? 부모 정보와 연관된 자녀 정보도 모두 삭제됩니다.')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/erp/parent/delete/${parentId}`;

            // 디버깅을 위한 로그
            console.log('Delete URL:', form.action);

            document.body.appendChild(form);
            form.submit();
        }
    }
    /*]]>*/
});// $(document).ready(function() END

