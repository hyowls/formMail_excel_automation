export const onlyDigits = (value) => value.replace(/\D/g, "");

// 한글(입력 중인 자모 포함)·영문·공백만 남기고, 앞 공백과 연속 공백은 제거
export function sanitizeName(value) {
  return value
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]/g, "")
    .replace(/^ +/, "")
    .replace(/ {2,}/g, " ");
}

// 02 지역번호: 02-123-4567 / 02-1234-5678
// 그 외:       010-123-4567 / 010-1234-5678 / 031-123-4567
export function formatPhone(value) {
  const all = onlyDigits(value);
  const isSeoul = all.startsWith("02");
  const fullLength = isSeoul ? 10 : 11;
  const digits = all.slice(0, fullLength);
  const areaLength = isSeoul ? 2 : 3;

  if (digits.length <= areaLength) return digits;

  const area = digits.slice(0, areaLength);
  const rest = digits.slice(areaLength);
  const middleLength = digits.length === fullLength ? 4 : 3;

  if (rest.length <= middleLength) return `${area}-${rest}`;
  return `${area}-${rest.slice(0, middleLength)}-${rest.slice(middleLength)}`;
}

// 포맷된 문자열에서 n번째 숫자 바로 뒤의 위치 (커서 복원용)
export function caretAfterDigits(formatted, count) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++seen === count) return i + 1;
  }
  return formatted.length;
}

export const formatBirth = ({ year, month, day }) => `${year}-${month}-${day}`;

const NAME_PATTERN = /^[가-힣a-zA-Z]+( [가-힣a-zA-Z]+)*$/;

function validateName(value) {
  const name = value.trim();
  if (!name) return "이름을 입력해 주세요.";
  if (!NAME_PATTERN.test(name)) return "이름은 한글(완성된 글자) 또는 영문으로 입력해 주세요.";
}

function validateBirth({ year, month, day }) {
  if (!year && !month && !day) return "생년월일을 입력해 주세요.";
  if (year.length !== 4 || !month || !day) return "생년월일을 YYYY-MM-DD 형식으로 모두 입력해 주세요.";

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (y < 1900) return "올바른 출생 연도를 입력해 주세요.";

  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return "존재하지 않는 날짜입니다.";
  }
  if (date > new Date()) return "생년월일은 오늘 이후일 수 없습니다.";
}

function validatePhone(value) {
  const digits = onlyDigits(value);
  if (!digits) return "휴대폰 번호를 입력해 주세요.";
  const valid = digits.startsWith("02") ? /^02\d{7,8}$/.test(digits) : /^0\d{9,10}$/.test(digits);
  if (!valid) return "올바른 번호를 입력해 주세요. (예: 010-1234-5678)";
}

export function validateForm(form) {
  const errors = {
    name: validateName(form.name),
    birth: validateBirth(form.birth),
    gender: form.gender ? undefined : "성별을 선택해 주세요.",
    phone: validatePhone(form.phone),
    address: form.address ? undefined : "주소 검색으로 주소를 입력해 주세요.",
    message: form.message.trim() ? undefined : "문의 내용을 입력해 주세요.",
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}
