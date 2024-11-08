document.addEventListener('DOMContentLoaded', function() {
    let draggedEventIsAllDay;
    let activeInactiveWeekends = true;
    
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        contentHeight: 'auto',   // 자동으로 높이를 설정하여 스크롤 방지
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        
        // 버튼 텍스트 한글로 변경
        buttonText: {
            today: '오늘',
            month: '월',
            week: '주',
            day: '일',
            list: '목록'
        },
        
        // 타이틀 포맷 설정 (예: 2024년 3월)
        titleFormat: {
            year: 'numeric',
            month: 'long'
        },
        
        // 기본 설정
        editable: true,
        selectable: true,
        dayMaxEvents: false, // "more" 링크를 없애고 모든 이벤트 표시
        navLinks: true,
        nowIndicator: true,
        
        // 시간 설정
        slotMinTime: '00:00:00',
        slotMaxTime: '24:00:00',
        
        // 이벤트 데이터 가져오기
        events: function(info, successCallback, failureCallback) {
            $.ajax({
                url: '/events',
                method: 'GET',
                success: function(response) {
                    const events = response.map(event => ({
                        id: event.id,
                        title: event.title,
                        start: event.start,
                        end: event.end,
                        description: event.description,
                        type: event.type,
                        username: event.username,
                        backgroundColor: event.backgroundColor,
                        textColor: event.textColor || '#ffffff',
                        allDay: event.allDay
                    }));
                    successCallback(events);
                },
                error: function(err) {
                    console.error('이벤트 로딩 실패:', err);
                    failureCallback(err);
                }
            });
        },

        // 이벤트 클릭
        eventClick: function(info) {
            editEvent(info.event);
        },

        // 날짜 선택
        select: function(info) {
            const startDate = moment(info.start).format('YYYY-MM-DD HH:mm');
            const endDate = moment(info.end).format('YYYY-MM-DD HH:mm');
            
            $("#contextMenu")
                .css({
                    display: "block",
                    left: info.jsEvent.pageX,
                    top: info.jsEvent.pageY
                });

            $("#contextMenu .dropdown-item").off('click').on('click', function(e) {
                e.preventDefault();
                const eventType = $(this).text();
                $("#contextMenu").hide();
                newEvent(startDate, endDate, eventType);
            });
        },

        // 이벤트 드래그 & 리사이즈
        eventDrop: function(info) {
            const event = info.event;
            const newStart = moment(event.start).format('YYYY-MM-DDTHH:mm:ss');
            const newEnd = event.end ? moment(event.end).format('YYYY-MM-DDTHH:mm:ss') : newStart;

            // 종일 이벤트와 시간 이벤트 간의 변환 방지
            if (info.view.type === 'timeGridWeek' || info.view.type === 'timeGridDay') {
                if (draggedEventIsAllDay !== event.allDay) {
                    alert('종일 일정은 시간 일정으로 변경할 수 없습니다.');
                    info.revert();
                    return;
                }
            }

            const eventData = {
                start: newStart,
                end: newEnd,
                allDay: event.allDay
            };

            $.ajax({
                url: `/events/drag/${event.id}`,
                type: 'PUT',
                data: JSON.stringify(eventData),
                contentType: 'application/json',
                success: function(response) {
                    alert('일정이 수정되었습니다.');
                },
                error: function() {
                    alert('일정 수정 중 오류가 발생했습니다.');
                    info.revert();
                }
            });
        },

        eventResize: function(info) {
            const event = info.event;
            const eventData = {
                start: moment(event.start).format('YYYY-MM-DDTHH:mm:ss'),
                end: moment(event.end).format('YYYY-MM-DDTHH:mm:ss'),
                allDay: event.allDay
            };

            $.ajax({
                url: `/events/${event.id}`,
                type: 'PUT',
                data: JSON.stringify(eventData),
                contentType: 'application/json',
                success: function(response) {
                    alert('일정이 수정되었습니다.');
                },
                error: function() {
                    alert('일정 수정 중 오류가 발생했습니다.');
                    info.revert();
                }
            });
        },

        // 드래그 앤 드롭 관련 설정 추가/수정
        eventDragStart: function(info) {
            draggedEventIsAllDay = info.event.allDay;
        }
    });

    // 캘린더 렌더링
    calendar.render();

    // 전역 calendar 객체 설정
    window.calendar = calendar;

    // 문서 클릭시 컨텍스트 메뉴 숨기기
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#contextMenu').length) {
            $("#contextMenu").hide();
        }
    });
});

// 이벤트 날짜 업데이트 함수
function updateEventDates(event, revertFunc) {
    const eventData = {
        start: moment(event.start).format('YYYY-MM-DD HH:mm'),
        end: moment(event.end || event.start).format('YYYY-MM-DD HH:mm')
    };

    $.ajax({
        url: `/events/${event.id}`,
        type: 'PUT',
        data: JSON.stringify(eventData),
        contentType: 'application/json',
        success: function(response) {
            calendar.refetchEvents();
        },
        error: function() {
            revertFunc();
            alert('일정 수정 중 오류가 발생했습니다.');
        }
    });
}
