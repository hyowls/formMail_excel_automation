import { Fragment, useRef } from "react";
import { onlyDigits } from "../utils/formValidation";

const SEGMENTS = [
  { key: "year", length: 4, placeholder: "YYYY", label: "출생 연도" },
  { key: "month", length: 2, placeholder: "MM", label: "출생 월", maxFirstDigit: "1" },
  { key: "day", length: 2, placeholder: "DD", label: "출생 일", maxFirstDigit: "3" },
];

const pad = (v) => (v.length === 1 && v !== "0" ? `0${v}` : v);

// YYYY - MM - DD 세 칸으로 나눠 숫자만 입력받고, '-'는 화면에 고정으로 표시
export default function BirthDateInput({ id, value, onChange, onBlur, invalid, describedBy }) {
  const refs = useRef([]);

  function focusSegment(index) {
    const el = refs.current[index];
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }

  function handleChange(index, raw) {
    const segment = SEGMENTS[index];
    let next = onlyDigits(raw).slice(0, segment.length);
    // 월 첫 자리에 2~9, 일 첫 자리에 4~9를 입력하면 0을 붙여 바로 완성
    if (segment.maxFirstDigit && next.length === 1 && next > segment.maxFirstDigit) next = `0${next}`;

    onChange({ ...value, [segment.key]: next });
    if (next.length === segment.length) focusSegment(index + 1);
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && e.currentTarget.value === "" && index > 0) {
      e.preventDefault();
      focusSegment(index - 1);
    }
  }

  // 19991201, 1999-12-01 같은 값을 붙여넣으면 세 칸에 나눠 채움
  function handlePaste(e) {
    const digits = onlyDigits(e.clipboardData.getData("text"));
    if (digits.length !== 8) return;
    e.preventDefault();
    onChange({ year: digits.slice(0, 4), month: digits.slice(4, 6), day: digits.slice(6, 8) });
    focusSegment(2);
  }

  // 세 칸 밖으로 포커스가 나갈 때만 한 자리 월/일을 0으로 채우고 blur 처리
  function handleGroupBlur(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    const padded = { ...value, month: pad(value.month), day: pad(value.day) };
    if (padded.month !== value.month || padded.day !== value.day) onChange(padded);
    onBlur?.();
  }

  return (
    <div className={`segmented${invalid ? " is-invalid" : ""}`} onBlur={handleGroupBlur}>
      {SEGMENTS.map((segment, index) => (
        <Fragment key={segment.key}>
          {index > 0 && (
            <span className="segmented__dash" aria-hidden="true">
              -
            </span>
          )}
          <input
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={index === 0 ? id : undefined}
            className={`segmented__input segmented__input--${segment.key}`}
            type="text"
            inputMode="numeric"
            autoComplete={`bday-${segment.key}`}
            placeholder={segment.placeholder}
            aria-label={segment.label}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            value={value[segment.key]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
          />
        </Fragment>
      ))}
    </div>
  );
}
