import { useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";
import KakaoPostcodeEmbed from "react-daum-postcode";

// 도로명 주소면 (법정동, 아파트명) 참고항목을 붙임 — 카카오 공식 예제와 같은 방식
function toFullAddress(data) {
  if (data.userSelectedType === "J") return data.jibunAddress;

  const extras = [];
  if (data.bname && /[동로가]$/.test(data.bname)) extras.push(data.bname);
  if (data.buildingName && data.apartment === "Y") extras.push(data.buildingName);
  return extras.length ? `${data.roadAddress} (${extras.join(", ")})` : data.roadAddress;
}

export default function AddressSearchModal({ onSelect, onClose }) {
  const closeRef = useRef(null);
  const handleEscape = useEffectEvent((e) => {
    if (e.key === "Escape") onClose();
  });

  // 열려 있는 동안 배경 스크롤을 막고 Esc로 닫을 수 있게 함
  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return createPortal(
    <div
      className="modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby="address-modal-title">
        <div className="modal__header">
          <h2 id="address-modal-title" className="modal__title">
            주소 검색
          </h2>
          <button ref={closeRef} type="button" className="modal__close" aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </div>
        <KakaoPostcodeEmbed
          className="modal__body"
          style={{ height: "100%" }}
          onComplete={(data) => onSelect({ zonecode: data.zonecode, address: toFullAddress(data) })}
        />
      </div>
    </div>,
    document.body,
  );
}
