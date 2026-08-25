import { z } from 'zod';

// 생년월일·대학은 학생인증(1단계)에서 자동 입력 — 프로필 폼에서는 받지 않는다
export const profileSchema = z
  .object({
    nickname: z
      .string()
      .min(2, '닉네임은 2자 이상이어야 해요')
      .max(20, '닉네임은 20자 이하여야 해요')
      .regex(/^[가-힣a-zA-Z0-9]+$/, '닉네임에 특수문자를 사용할 수 없어요'),
    gender: z.enum(['MALE', 'FEMALE']).refine((v) => !!v, { message: '성별을 선택해 주세요' }),
    contactType: z.enum(['INSTAGRAM', 'PHONE']),
    contactValue: z.string().min(1, '연락처를 입력해 주세요'),
  })
  .refine(
    (data) => {
      if (data.contactType === 'INSTAGRAM') {
        return /^@?[\w.]+$/.test(data.contactValue);
      }
      return /^010-?\d{4}-?\d{4}$/.test(data.contactValue);
    },
    { message: '연락처 형식을 확인해 주세요', path: ['contactValue'] }
  );

export type ProfileFormData = z.infer<typeof profileSchema>;
