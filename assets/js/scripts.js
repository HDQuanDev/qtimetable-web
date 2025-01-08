// Add this at the top of your file
const periods = {
    1: { start: "6:45", end: "7:35" },
    2: { start: "7:40", end: "8:30" },
    3: { start: "8:40", end: "9:30" },
    4: { start: "9:40", end: "10:30" },
    5: { start: "10:35", end: "11:25" },
    6: { start: "13:00", end: "13:50" },
    7: { start: "13:55", end: "14:45" },
    8: { start: "14:50", end: "15:40" },
    9: { start: "15:55", end: "16:45" },
    10: { start: "16:50", end: "17:40" },
    11: { start: "18:15", end: "19:05" },
    12: { start: "19:10", end: "20:00" },
    13: { start: "20:10", end: "21:00" },
    14: { start: "21:10", end: "22:00" },
    15: { start: "22:10", end: "23:00" },
    16: { start: "23:30", end: "00:20" },
};
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'blue-600': '#2563EB'
            }
        }
    }
};
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Load theme from local storage or system preference
    const loadTheme = () => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            html.classList.toggle('dark', currentTheme === 'dark');
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.classList.toggle('dark', prefersDark);
            localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
        }
    };

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Initial theme load
    loadTheme();
});

// Hàm để xử lý đăng nhập
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    document.getElementById('btn-login').textContent = 'Đang đăng nhập...';
    document.getElementById('btn-login').disabled = true;
    try {
        const response = await fetch('https://search.quanhd.net/get_tkb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            localStorage.setItem('lastUpdated', new Date().toISOString());
            window.location.href = 'tkb.html';
        } else {
            errorMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng!';
            errorMessage.classList.remove('hidden');
            document.getElementById('btn-login').textContent = 'Đăng nhập';
            document.getElementById('btn-login').disabled = false;
        }
    } catch (error) {
        console.error('Đã xảy ra lỗi:', error);
        errorMessage.textContent = 'Đã xảy ra lỗi khi đăng nhập!';
        errorMessage.classList.remove('hidden');
        document.getElementById('btn-login').textContent = 'Đăng nhập';
        document.getElementById('btn-login').disabled = false;
    }
}

// Hàm để kiểm tra xem ngày hiện tại có nằm trong khoảng thời gian của tuần hay không
function isCurrentWeek(startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Split dd/mm/yyyy and create Date object
    const [startDay, startMonth, startYear] = startDate.split('/');
    const [endDay, endMonth, endYear] = endDate.split('/');

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    end.setHours(23, 59, 59, 999);

    return today >= start && today <= end;
}

// Hàm để lấy tuần hiện tại
function getCurrentWeek(tkbData) {
    if (!tkbData || !Array.isArray(tkbData)) {
        console.error('Invalid tkbData');
        return 1; // Return default week if data is invalid
    }

    const today = new Date();
    let currentWeek = null;

    for (let i = 0; i < tkbData.length; i++) {
        const week = tkbData[i];
        if (!week.start_date || !week.end_date) continue;

        if (isCurrentWeek(week.start_date, week.end_date)) {
            currentWeek = parseInt(week.week_number);
            break;
        }
    }

    // If no matching week is found, return the closest upcoming week
    if (currentWeek === null) {
        for (let i = 0; i < tkbData.length; i++) {
            const week = tkbData[i];
            const [endDay, endMonth, endYear] = week.end_date.split('/');
            const endDate = new Date(endYear, endMonth - 1, endDay);

            if (today <= endDate) {
                currentWeek = parseInt(week.week_number);
                break;
            }
        }
    }

    // If still no week found, return week 1
    return currentWeek || 1;
}

// Hàm để lấy ngày hiện tại
function getToDay() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysOfWeek = ["2", "3", "4", "5", "6", "7", "CN"];
    const currentDay = daysOfWeek[dayOfWeek];
    return currentDay;
}

// Hàm chuyển đổi số thứ tự ngày sang text
function getDayText(dayNumber) {
    const daysMap = {
        "2": "Thứ hai",
        "3": "Thứ ba",
        "4": "Thứ tư",
        "5": "Thứ năm",
        "6": "Thứ sáu",
        "7": "Thứ bảy",
        "CN": "Chủ nhật"
    };
    return daysMap[dayNumber] || dayNumber;
}

// Hàm để lấy ngày hiện tại dạng số
function getToDayNumber() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert from JS format (0 = Sunday, 1 = Monday,...) to required format (2,3,4,5,6,7,CN)
    const dayMap = {
        0: "CN", // Sunday
        1: "2",  // Monday
        2: "3",  // Tuesday
        3: "4",  // Wednesday
        4: "5",  // Thursday
        5: "6",  // Friday
        6: "7"   // Saturday
    };
    return dayMap[dayOfWeek];
}

// Hàm sắp xếp dữ liệu theo thứ
function sortByWeekday(data) {
    const dayOrder = {
        "2": 0,  // Monday is first (index 0)
        "3": 1,
        "4": 2,
        "5": 3,
        "6": 4,
        "7": 5,
        "CN": 6  // Sunday is last (index 6)
    };

    return data.sort((a, b) => dayOrder[a.thu] - dayOrder[b.thu]);
}

function getClassTimes(tietHoc) {
    // Handle format "6 --> 10"
    const [startPeriod, endPeriod] = tietHoc.split('-->').map(t => parseInt(t.trim()));

    if (!periods[startPeriod] || !periods[endPeriod]) {
        console.error('Invalid period:', tietHoc);
        return {
            start: 'Invalid time',
            end: 'Invalid time'
        };
    }

    return {
        start: periods[startPeriod].start,
        end: periods[endPeriod].end
    };
}

function displayTKB(tkbData, currentWeek = null) {
    const tkbContainer = document.getElementById('tkb-container');
    const weekInfo = document.getElementById('week-info');
    tkbContainer.innerHTML = '';

    const weekData = tkbData.find(week => parseInt(week.week_number) === currentWeek);
    const isDisplayedWeekCurrent = weekData && isCurrentWeek(weekData.start_date, weekData.end_date);

    // Add responsive grid container
    tkbContainer.className = 'grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4';

    if (weekData) {
        // Enhanced week info display
        weekInfo.innerHTML = `
            <div class="flex flex-col items-center mb-8 space-y-2">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                    Tuần ${weekData.week_number}
                </h2>
                <p class="text-lg text-gray-600 dark:text-gray-400">
                    ${formatDate(weekData.start_date)} - ${formatDate(weekData.end_date)}
                </p>
                <div class="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
            </div>
        `;

        const currentDayNumber = getToDayNumber();
        const sortedData = sortByWeekday(weekData.data);
        const daysOfWeek = ["2", "3", "4", "5", "6", "7", "CN"];

        daysOfWeek.forEach(day => {
            const dayData = sortedData.filter(item => item.thu === day);
            const isToday = day === currentDayNumber && isDisplayedWeekCurrent;

            const dayCard = document.createElement('div');
            dayCard.className = `
                transform transition-all duration-500 hover:scale-[1.02]
                ${isToday ? 'animate__animated animate__fadeIn animate__slower' : ''}
                rounded-2xl shadow-lg overflow-hidden
                ${isToday
                    ? 'bg-gradient-to-br from-yellow-50/90 to-orange-50/90 dark:from-yellow-900/90 dark:to-orange-900/90'
                    : 'bg-white/90 dark:bg-gray-800/90'}
                backdrop-filter backdrop-blur-lg
                border border-gray-200/50 dark:border-gray-700/50
                flex flex-col h-full
            `;

            const headerGradient = isToday
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500';

            dayCard.innerHTML = `
                <div class="${headerGradient} h-2 w-full"></div>
                <div class="p-5 flex-1 flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center space-x-2">
                            <span class="text-xl font-bold ${isToday ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}">
                                ${getDayText(day)}
                            </span>
                            ${isToday ? `
                                <span class="px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full animate-pulse">
                                    Hôm nay
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="space-y-4 flex-1">
                        ${dayData.length > 0 ? dayData.map(item => {
                const times = getClassTimes(item.tiet_hoc);
                return `
                                <div class="group p-4 rounded-xl transition-all duration-300
                                    ${isToday
                        ? 'bg-white/70 dark:bg-gray-700/70 hover:bg-white/90 dark:hover:bg-gray-700/90'
                        : 'bg-gray-50/70 dark:bg-gray-700/70 hover:bg-gray-100/90 dark:hover:bg-gray-600/90'}
                                    hover:shadow-xl hover:transform hover:scale-[1.01]">
                                    <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        ${item.lop_hoc_phan}
                                    </h3>
                                    <div class="space-y-3">
                                        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                            <svg class="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            </svg>
                                            <span class="font-medium">${item.dia_diem}</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                            <svg class="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                            <span class="font-medium">${item.giang_vien}</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                            <svg class="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            <span class="font-medium">${times.start} - ${times.end}</span>
                                        </div>
                                        <div class="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 transition-all hover:bg-blue-200 dark:hover:bg-blue-800">
                                                Tiết: ${item.tiet_hoc}
                                            </span>
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ml-2 transition-all hover:bg-purple-200 dark:hover:bg-purple-800">
                                                Tuần: ${item.tuan_hoc}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            `;
            }).join('') : `
                            <div class="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl">
                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01"/>
                                </svg>
                                <p class="text-lg font-medium">Ngày này không có tiết học</p>
                                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Thời gian rảnh để học tập và nghỉ ngơi</p>
                            </div>
                        `}
                    </div>
                </div>
            `;

            tkbContainer.appendChild(dayCard);
        });
    } else {
        weekInfo.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01"/>
                </svg>
                <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Không có dữ liệu cho tuần hiện tại
                </h3>
                <p class="text-gray-500 dark:text-gray-400">
                    Vui lòng chọn tuần khác hoặc liên hệ quản trị viên
                </p>
            </div>
        `;
    }
}

// Helper function to format dates
function formatDate(dateString) {
    try {
        // Split the dd/mm/yyyy format
        const [day, month, year] = dateString.split('/');

        // Create date using year, month-1 (0-based), day
        const date = new Date(year, month - 1, day);

        // Validate if date is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        // Format the date
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return dateString; // Return original string if parsing fails
    }
}
// Hàm để hiển thị lịch thi
function displayLichThi(lichThiData) {
    const lichThiContainer = document.getElementById('lichthi-table-body');
    lichThiContainer.className = 'grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3';
    lichThiContainer.innerHTML = '';

    if (lichThiData && lichThiData.length > 0) {
        lichThiData.forEach(item => {
            const card = document.createElement('div');
            card.className = `
                bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
                transition-all duration-200 p-4 border border-gray-200 dark:border-gray-700
            `;
            card.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        #${item.STT}
                    </span>
                    <span class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 
                        dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        ${item.gio_thi}
                    </span>
                </div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    ${item.ten_hoc_phan}
                </h3>
                <div class="space-y-2">
                    <div class="flex items-center text-gray-600 dark:text-gray-400">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>${item.ngay_thi}</span>
                    </div>
                    <div class="flex items-center text-gray-600 dark:text-gray-400">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span>${item.phong_thi}</span>
                    </div>
                </div>
            `;
            lichThiContainer.appendChild(card);
        });
    } else {
        lichThiContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01"/>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">Không có dữ liệu lịch thi</p>
            </div>
        `;
    }
}

function displayDiemSo(diemData, diemDetailData) {
    const diemDetailContainer = document.getElementById('diem-detail-table-body');
    const diemSummaryContainer = document.getElementById('diem-summary-table-body');

    // Style containers
    diemDetailContainer.className = 'grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4';
    diemSummaryContainer.className = 'grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4';

    diemDetailContainer.innerHTML = '';
    diemSummaryContainer.innerHTML = '';

    // Display detailed scores
    diemDetailData.forEach(item => {
        const card = document.createElement('div');
        card.className = `
            bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
            transition-all duration-200 p-4 border border-gray-200 dark:border-gray-700
        `;

        // Split all scores into arrays
        const ccScores = item.cc.split('\n');
        const thiScores = item.thi.split('\n');
        const tkhpScores = item.tkhp.split('\n');
        const diemChuScores = item.diem_chu.split('\n');

        // Get latest scores
        const latestCC = ccScores[ccScores.length - 1];
        const latestThi = thiScores[thiScores.length - 1];
        const latestTKHP = tkhpScores[tkhpScores.length - 1];
        const latestDiemChu = diemChuScores[diemChuScores.length - 1];

        const status = parseFloat(latestTKHP) >= 4 ? 'Đạt' : 'Chưa đạt';

        // Generate history HTML if multiple attempts exist
        let historyHTML = '';
        if (ccScores.length > 1) {
            historyHTML = `
                <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Lịch sử các lần học
                    </div>
                    ${ccScores.map((cc, index) => `
                        <div class="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                            <div class="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                Lần ${index + 1}:
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">CC:</span>
                                    <span class="font-medium">${cc}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Thi:</span>
                                    <span class="font-medium">${thiScores[index] || 'N/A'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">TKHP:</span>
                                    <span class="font-medium">${tkhpScores[index] || 'N/A'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Điểm chữ:</span>
                                    <span class="font-medium">${diemChuScores[index] || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ${item.ma_hoc_phan}
                </span>
                <span class="px-3 py-1 text-xs font-medium 
                    ${status === 'Đạt' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} 
                    rounded-full">
                    ${status}
                </span>
            </div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
                ${item.ten_hoc_phan}
            </h3>
            <div class="grid grid-cols-2 gap-3 text-sm mb-4">
                <div class="flex flex-col">
                    <span class="text-gray-500 dark:text-gray-400">Chuyên cần</span>
                    <span class="font-medium text-gray-900 dark:text-gray-100">${latestCC}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-gray-500 dark:text-gray-400">Thi</span>
                    <span class="font-medium text-gray-900 dark:text-gray-100">${latestThi}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-gray-500 dark:text-gray-400">TKHP</span>
                    <span class="font-medium text-gray-900 dark:text-gray-100">${latestTKHP}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-gray-500 dark:text-gray-400">Điểm chữ</span>
                    <span class="font-medium text-gray-900 dark:text-gray-100">${latestDiemChu}</span>
                </div>
            </div>
            <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">
                        Số TC: ${item.so_tc}
                    </span>
                    <span class="text-gray-500 dark:text-gray-400">
                        Lần học: ${item.lan_hoc}
                    </span>
                    <span class="text-gray-500 dark:text-gray-400">
                        Lần thi: ${item.lan_thi}
                    </span>
                </div>
            </div>
            ${historyHTML}
        `;
        diemDetailContainer.appendChild(card);
    });

    // Display summary scores
    diemData.forEach(item => {
        const card = document.createElement('div');
        card.className = `
            bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
            transition-all duration-200 p-4 border border-gray-200 dark:border-gray-700
        `;
        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ${item.hoc_ky} - ${item.nam_hoc}
                </span>
                <span class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 
                    dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    ${item.so_tc_n1} TC
                </span>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Điểm trung bình
                    </h4>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400">Hệ 10</span>
                            <p class="font-medium text-gray-900 dark:text-gray-100">${item.tbc_he10_n1}</p>
                        </div>
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400">Hệ 4</span>
                            <p class="font-medium text-gray-900 dark:text-gray-100">${item.tbc_he4_n1}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Điểm TL
                    </h4>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400">Hệ 10</span>
                            <p class="font-medium text-gray-900 dark:text-gray-100">${item.tbtl_he10_n1}</p>
                        </div>
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400">Hệ 4</span>
                            <p class="font-medium text-gray-900 dark:text-gray-100">${item.tbtl_he4_n1}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    Số TCTL: ${item.so_tctl_n1}
                </span>
            </div>
        `;
        diemSummaryContainer.appendChild(card);
    });
}

function initializeTabs() {
    const tabDetail = document.getElementById('tab-detail');
    const tabSummary = document.getElementById('tab-summary');
    const tabDetailContent = document.getElementById('tab-detail-content');
    const tabSummaryContent = document.getElementById('tab-summary-content');

    if (!tabDetail || !tabSummary || !tabDetailContent || !tabSummaryContent) {
        return;
    }

    function switchTab(activeTab, activeContent, inactiveTab, inactiveContent) {
        // Update tab buttons
        activeTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        activeTab.classList.remove('text-gray-500');
        inactiveTab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        inactiveTab.classList.add('text-gray-500');

        // Show/hide content with animation
        activeContent.classList.remove('hidden');
        activeContent.classList.add('animate-fadeIn');
        inactiveContent.classList.add('hidden');
    }

    tabDetail.addEventListener('click', () => {
        switchTab(tabDetail, tabDetailContent, tabSummary, tabSummaryContent);
    });

    tabSummary.addEventListener('click', () => {
        switchTab(tabSummary, tabSummaryContent, tabDetail, tabDetailContent);
    });
}

// Call this when document loads
document.addEventListener('DOMContentLoaded', initializeTabs);

// Hàm để xử lý đăng xuất
function handleLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Hàm để kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Get current path and normalize it
    const currentPath = window.location.pathname.toLowerCase();

    // Check if on login page (handle both root and subfolder cases)
    const isLoginPage = currentPath.endsWith('login.html') || currentPath === '/';

    if (!userData && !isLoginPage) {
        // Use relative path for better compatibility
        window.location.replace('./login.html');
    } else if (userData && isLoginPage) {
        window.location.replace('./tkb.html');
    }
}

// Call the function when DOM is ready
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Xử lý sự kiện đăng nhập
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Xử lý sự kiện đăng xuất
const logoutButtons = document.querySelectorAll('#logout');
if (logoutButtons) {
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
}

// Utilities
const Theme = {
    DARK: 'dark',
    LIGHT: 'light'
};

// Styles configuration
const config = {
    notification: {
        colors: {
            error: {
                light: 'bg-red-500',
                dark: 'dark:bg-red-600'
            },
            success: {
                light: 'bg-green-500',
                dark: 'dark:bg-green-600'
            },
            warning: {
                light: 'bg-yellow-500',
                dark: 'dark:bg-yellow-600'
            },
            info: {
                light: 'bg-blue-500',
                dark: 'dark:bg-blue-600'
            }
        },
        icons: {
            error: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>`,
            success: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>`,
            warning: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>`,
            info: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>`
        }
    }
};

// Styles
const styles = `
    @keyframes slideIn {
        from { 
            transform: translateX(100%);
            opacity: 0;
        }
        to { 
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from { 
            transform: translateX(0);
            opacity: 1;
        }
        to { 
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .animate-slide-in {
        animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animate-slide-out {
        animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    .notification-container {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 28rem;
        width: calc(100% - 2rem);
        pointer-events: none;
    }

    .notification {
        pointer-events: auto;
    }

    @media (max-width: 640px) {
        .notification-container {
            bottom: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            padding: 0.5rem;
        }
    }
`;

// Create and inject styles
const createStyles = () => {
    if (!document.getElementById('custom-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'custom-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
};

// Create required DOM elements
const createRequiredElements = () => {
    // Create notification container
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Create loading overlay
    if (!document.getElementById('loading-overlay')) {
        const overlayHTML = `
            <div id="loading-overlay" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm hidden
                flex items-center justify-center z-50 transition-all duration-300">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl flex flex-col items-center
                    transform transition-all duration-300 shadow-2xl">
                    <div class="relative w-20 h-20">
                        <div class="absolute inset-0 border-4 border-blue-100 dark:border-blue-900 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-blue-500 dark:border-blue-400 
                            rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p class="mt-6 text-gray-600 dark:text-gray-300 text-lg font-medium">
                        Đang cập nhật dữ liệu mới, vui lòng chờ...
                    </p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }
};

// Show notification
const showNotification = (message, type = 'info', duration = 5000) => {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    const id = `notification-${Date.now()}`;

    const colorClasses = `${config.notification.colors[type].light} ${config.notification.colors[type].dark}`;

    notification.id = id;
    notification.className = `
        notification flex items-center gap-3 p-4 rounded-xl shadow-lg transform
        ${colorClasses} text-white
        animate-slide-in
        hover:scale-105 transition-all duration-300
        cursor-pointer
        max-w-full
    `;

    notification.innerHTML = `
        <div class="flex-shrink-0">
            ${config.notification.icons[type]}
        </div>
        <p class="flex-1 text-sm sm:text-base font-medium">${message}</p>
        <button class="flex-shrink-0 hover:opacity-75 transition-opacity focus:outline-none
            focus:ring-2 focus:ring-white/50 rounded-lg p-1" 
            aria-label="Close notification">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    // Add click handler for close button
    const closeButton = notification.querySelector('button');
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        removeNotification(notification);
    });

    // Add click handler for entire notification
    notification.addEventListener('click', () => {
        removeNotification(notification);
    });

    container.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => removeNotification(notification), duration);
};

// Remove notification with animation
const removeNotification = (notification) => {
    notification.classList.add('animate-slide-out');
    setTimeout(() => notification.remove(), 300);
};

// Initialize theme based on system preference
const initializeTheme = () => {
    if (!localStorage.getItem('theme')) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }
};

// Data update handler
const handleDataUpdate = async () => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    if (!username || !password) {
        showNotification('Vui lòng đăng nhập để cập nhật dữ liệu', 'warning');
        return;
    }

    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay?.classList.remove('hidden');

    try {
        const response = await fetch('https://search.quanhd.net/get_tkb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('lastUpdated', new Date().toISOString());

            showNotification('Cập nhật dữ liệu thành công!', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            throw new Error('Không thể cập nhật dữ liệu');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(
            'Đã xảy ra lỗi khi cập nhật dữ liệu. Vui lòng thử lại sau!',
            'error'
        );
    } finally {
        loadingOverlay?.classList.add('hidden');
    }
};

// Initialize everything
const initialize = () => {
    createStyles();
    createRequiredElements();
    initializeTheme();

    // Add event listeners to update buttons
    document.querySelectorAll('#update-data').forEach(button => {
        button.addEventListener('click', handleDataUpdate);
    });
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Export functions for external use
window.showNotification = showNotification;
if (window.location.pathname.includes('profile.html')) {
    // Get student info from local storage
    const userInfo = JSON.parse(localStorage.getItem('userData')).user_info;
    // Display student info
    const studentInfoContainer = document.getElementById('student-info');
    if (userInfo) {
        studentInfoContainer.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-user-graduate fa-2x text-gray-600 dark:text-gray-400 mr-4"></i>
            <div>
                <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold">Họ tên:</span> ${userInfo.name}</p>
                <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold">MSSV:</span> ${userInfo.masinhvien}</p>
            </div>
        </div>
        <div class="flex items-center">
            <i class="fas fa-university fa-2x text-gray-600 dark:text-gray-400 mr-4"></i>
            <div>
                <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold">Ngành:</span> ${userInfo.nganh}</p>
                <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold">Khóa:</span> ${userInfo.khoa}</p>
            </div>
        </div>
    `;
    } else {
        studentInfoContainer.innerHTML = '<p class="text-gray-700 dark:text-gray-300">Không tìm thấy thông tin sinh viên.</p>';
    }
}
if (!window.location.pathname.includes('login.html')) {
    document.getElementById('title').textContent = JSON.parse(localStorage.getItem('userData')).user_info.name + ' - ICTU';
}
// Xử lý sự kiện chuyển tuần
let currentWeek = 1;
const prevWeekButton = document.getElementById('prev-week');
const nextWeekButton = document.getElementById('next-week');

if (prevWeekButton && nextWeekButton) {
    prevWeekButton.addEventListener('click', () => {
        if (currentWeek > 1) {
            currentWeek--;
            const userData = JSON.parse(localStorage.getItem('userData'));
            displayTKB(userData.thoikhoabieu, currentWeek);
        }
    });

    nextWeekButton.addEventListener('click', () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (currentWeek < userData.thoikhoabieu.length) {
            currentWeek++;
            displayTKB(userData.thoikhoabieu, currentWeek);
        }
    });
}
// Gọi hàm kiểm tra trạng thái đăng nhập khi tải trang
checkLoginStatus();

// Hiển thị dữ liệu khi tải trang
if (window.location.pathname.includes('tkb.html')) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // Lấy tuần hiện tại từ dữ liệu
    currentWeek = getCurrentWeek(userData.thoikhoabieu);
    console.log(currentWeek);
    // Nếu không tìm thấy tuần hiện tại, hiển thị tuần đầu tiên
    if (currentWeek === null) {
        currentWeek = 1; // Hoặc tuần mà bạn muốn hiển thị mặc định
    }
    displayTKB(userData.thoikhoabieu, currentWeek);
} else if (window.location.pathname.includes('lichthi.html')) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    displayLichThi(userData.lichthi);
} else if (window.location.pathname.includes('diem.html')) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    displayDiemSo(userData.diem, userData.diem_detail);
}