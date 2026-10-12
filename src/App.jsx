import { useRef, useState } from "react";
import "./App.css";
import AddressSearchModal from "./components/AddressSearchModal";
import AutoGrowTextarea from "./components/AutoGrowTextarea";
import BirthDateInput from "./components/BirthDateInput";
import PhoneInput from "./components/PhoneInput";
import {
  formatBirth,
  sanitizeName,
  validateForm,
} from "./utils/formValidation";
import { sendToFormspree } from "./utils/formspree";

const INITIAL_FORM = {
  name: "",
  birth: { year: "", month: "", day: "" },
  gender: "",
  phone: "",
  zonecode: "",
  address: "",
  addressDetail: "",
  message: "",
};

const GENDERS = [
  { value: "male", label: "남" },
  { value: "female", label: "여" },
];

// 제출 시 첫 번째 오류 항목으로 포커스를 옮기기 위한 순서와 id
const FIELD_IDS = {
  name: "name",
  birth: "birth",
  gender: "gender-male",
  phone: "phone",
  address: "address-search",
  message: "message",
};

const MESSAGE_MAX_LENGTH = 2000;

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="field__error">
      {message}
    </p>
  );
}

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const addressSearchRef = useRef(null);
  const addressDetailRef = useRef(null);

  const errors = validateForm(form);
  const errorOf = (field) => (touched[field] ? errors[field] : undefined);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  // 오류가 보일 때만 aria-invalid / aria-describedby 연결
  const a11y = (field) =>
    errorOf(field)
      ? { "aria-invalid": true, "aria-describedby": `${field}-error` }
      : {};

  function closeAddressSearch() {
    setIsAddressOpen(false);
    touch("address");
    addressSearchRef.current?.focus();
  }

  function handleAddressSelect({ zonecode, address }) {
    setForm((prev) => ({ ...prev, zonecode, address }));
    setIsAddressOpen(false);
    touch("address");
    addressDetailRef.current?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError("");
    setTouched(
      Object.fromEntries(Object.keys(FIELD_IDS).map((field) => [field, true])),
    );

    const firstInvalid = Object.keys(FIELD_IDS).find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    const name = form.name.trim();
    const payload = {
      _subject: `[문의] ${name}님의 문의가 접수되었습니다`,
      이름: name,
      생년월일: formatBirth(form.birth),
      성별: GENDERS.find((g) => g.value === form.gender).label,
      휴대폰번호: form.phone,
      우편번호: form.zonecode,
      주소: form.address,
      상세주소: form.addressDetail.trim(),
      문의내용: form.message.trim(),
    };

    setIsSubmitting(true);
    try {
      await sendToFormspree(payload);
      setIsDone(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setTouched({});
    setIsDone(false);
  }

  if (isDone) {
    return (
      <main className="page">
        <section className="card card--done" role="status">
          <h1 className="card__title">문의가 접수되었습니다</h1>
          <p className="card__desc">
            확인 후 입력하신 연락처로 답변드리겠습니다.
          </p>
          <button type="button" className="submit" onClick={handleReset}>
            새 문의 작성
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <h1 className="card__title">문의하기</h1>
        <p className="card__desc">
          아래 항목을 입력해 주세요. <span className="required">*</span> 표시는
          필수 항목입니다.
        </p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="name">
              이름 <span className="required">*</span>
            </label>
            <input
              id="name"
              className={`input${errorOf("name") ? " is-invalid" : ""}`}
              type="text"
              autoComplete="name"
              placeholder="홍길동"
              maxLength={30}
              value={form.name}
              onChange={(e) => update("name", sanitizeName(e.target.value))}
              onBlur={() => {
                update("name", form.name.trim());
                touch("name");
              }}
              {...a11y("name")}
            />
            <FieldError id="name-error" message={errorOf("name")} />
          </div>

          <fieldset className="field">
            <legend className="field__label">
              생년월일 <span className="required">*</span>
            </legend>
            <BirthDateInput
              id="birth"
              value={form.birth}
              onChange={(birth) => update("birth", birth)}
              onBlur={() => touch("birth")}
              invalid={Boolean(errorOf("birth"))}
              describedBy={errorOf("birth") ? "birth-error" : undefined}
            />
            <FieldError id="birth-error" message={errorOf("birth")} />
          </fieldset>

          <fieldset
            className="field"
            {...(errorOf("gender")
              ? { "aria-describedby": "gender-error" }
              : {})}
          >
            <legend className="field__label">
              성별 <span className="required">*</span>
            </legend>
            <div className="radio-group">
              {GENDERS.map(({ value, label }) => (
                <label
                  key={value}
                  className={`radio${errorOf("gender") ? " is-invalid" : ""}`}
                >
                  <input
                    id={`gender-${value}`}
                    type="radio"
                    name="gender"
                    value={value}
                    checked={form.gender === value}
                    onChange={() => {
                      update("gender", value);
                      touch("gender");
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <FieldError id="gender-error" message={errorOf("gender")} />
          </fieldset>

          <div className="field">
            <label className="field__label" htmlFor="phone">
              휴대폰 번호 <span className="required">*</span>
            </label>
            <PhoneInput
              id="phone"
              className={`input input--phone${errorOf("phone") ? " is-invalid" : ""}`}
              placeholder="010-0000-0000"
              value={form.phone}
              onChange={(phone) => update("phone", phone)}
              onBlur={() => touch("phone")}
              {...a11y("phone")}
            />
            <FieldError id="phone-error" message={errorOf("phone")} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="address">
              주소 <span className="required">*</span>
            </label>
            <div className="address-row">
              <input
                className="input input--zonecode"
                type="text"
                placeholder="우편번호"
                aria-label="우편번호"
                value={form.zonecode}
                readOnly
                tabIndex={-1}
                onClick={() => setIsAddressOpen(true)}
              />
              <button
                ref={addressSearchRef}
                id="address-search"
                type="button"
                className="button-secondary"
                onClick={() => setIsAddressOpen(true)}
                {...a11y("address")}
              >
                주소 검색
              </button>
            </div>
            <AutoGrowTextarea
              id="address"
              className={`input textarea--address is-readonly${errorOf("address") ? " is-invalid" : ""}`}
              placeholder="주소 검색을 눌러 주소를 찾아주세요"
              value={form.address}
              readOnly
              tabIndex={-1}
              onClick={() => setIsAddressOpen(true)}
            />
            <input
              ref={addressDetailRef}
              id="addressDetail"
              className="input"
              type="text"
              autoComplete="address-line2"
              placeholder="상세 주소 (예: 101동 1001호)"
              aria-label="상세 주소"
              maxLength={100}
              value={form.addressDetail}
              onChange={(e) => update("addressDetail", e.target.value)}
            />
            <FieldError id="address-error" message={errorOf("address")} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="message">
              문의 내용 <span className="required">*</span>
            </label>
            <textarea
              id="message"
              className={`input textarea--message${errorOf("message") ? " is-invalid" : ""}`}
              placeholder="문의하실 내용을 입력해 주세요."
              maxLength={MESSAGE_MAX_LENGTH}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              onBlur={() => touch("message")}
              {...a11y("message")}
            />
            <div className="field__footer">
              <FieldError id="message-error" message={errorOf("message")} />
              <span className="field__counter">
                {form.message.length.toLocaleString()} /{" "}
                {MESSAGE_MAX_LENGTH.toLocaleString()}
              </span>
            </div>
          </div>

          {submitError && (
            <p className="submit-error" role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" className="submit" disabled={isSubmitting}>
            {isSubmitting ? "전송 중..." : "문의하기"}
          </button>
        </form>
      </section>

      {isAddressOpen && (
        <AddressSearchModal
          onSelect={handleAddressSelect}
          onClose={closeAddressSearch}
        />
      )}
    </main>
  );
}

export default App;
