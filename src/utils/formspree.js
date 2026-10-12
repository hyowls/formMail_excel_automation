const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;

// Formspree로 폼 데이터를 전송. 실패하면 사용자에게 보여줄 메시지로 Error를 던짐
export async function sendToFormspree(data) {
  if (!FORMSPREE_ID) {
    throw new Error("폼 전송 설정이 되어 있지 않습니다. (.env의 VITE_FORMSPREE_ID 확인)");
  }

  let response;
  try {
    response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("네트워크 오류로 전송하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.errors?.map((e) => e.message).join(", ");
    throw new Error(detail ? `전송에 실패했습니다: ${detail}` : "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
