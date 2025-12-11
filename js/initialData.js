export const initialData = {
    // 일정과 할 일을 통합 관리 (Single Source of Truth)
    tasks: [
        {
            id: "1",
            title: "유닉스 프로그래밍 수업",
            type: "EVENT", // EVENT(시간 점유) vs TASK(단순 할 일)
            categoryId: "SCHOOL",
            startAt: "2024-05-20T10:00:00", // 타임라인 배치 기준
            endAt: "2024-05-20T12:00:00",
            isTimeInclude: true, // true면 타임라인에 그림, false면 투두리스트에만
            isRecurring: true, // 반복 일정 여부
            recurrenceRule: "FREQ=WEEKLY;BYDAY=MO", // iCalendar RRULE 표준
            excludedDates: [],
            status: "TODO", // TODO, DONE
            description: "302호 강의실"
        },
        {
            id: "2",
            title: "우유 사기",
            type: "TASK",
            startAt: null,
            endAt: "2024-05-20T23:59:59", // 마감일
            isTimeInclude: false,
            status: "TODO"
        }
    ],
    goals: [],
    habits: [],
    ideas: []
};
