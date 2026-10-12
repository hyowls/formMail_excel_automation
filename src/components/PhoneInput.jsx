import { useLayoutEffect, useRef } from "react";
import { caretAfterDigits, formatPhone, onlyDigits } from "../utils/formValidation";

// 숫자만 입력받고 '-'는 자동으로 표시. 중간을 수정해도 커서 위치를 유지
export default function PhoneInput({ value, onChange, ...rest }) {
  const ref = useRef(null);
  const caret = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (caret.current === null || document.activeElement !== el) return;
    el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  function handleChange(e) {
    const raw = e.target.value;
    let digits = onlyDigits(raw);
    let digitsBeforeCaret = onlyDigits(raw.slice(0, e.target.selectionStart)).length;

    // '-'만 지워진 경우 그 앞 숫자를 지워서 백스페이스가 막히지 않게 함
    if (e.nativeEvent.inputType === "deleteContentBackward" && digits === onlyDigits(value) && digitsBeforeCaret > 0) {
      digits = digits.slice(0, digitsBeforeCaret - 1) + digits.slice(digitsBeforeCaret);
      digitsBeforeCaret -= 1;
    }

    const formatted = formatPhone(digits);
    caret.current = caretAfterDigits(formatted, digitsBeforeCaret);
    onChange(formatted);
  }

  return (
    <input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      value={value}
      onChange={handleChange}
      {...rest}
    />
  );
}
