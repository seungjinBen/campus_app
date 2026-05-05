import { z } from 'zod';

export const profileSchema = z
  .object({
    nickname: z
      .string()
      .min(2, '닉네임은 2자 이상이어야 해요')
      .max(20, '닉네임은 20자 이하여야 해요')
      .regex(/^[가-힣a-zA-Z0-9]+$/, '닉네임에 특수문자를 사용할 수 없어요'),
    gender: z.enum(['MALE', 'FEMALE']).refine((v) => !!v, { message: '성별을 선택해 주세요' }),
    birthDate: z
      .string()
      .regex(/^\d{8}$/, '생년월일 8자리를 입력해 주세요')
      .refine((val) => {
        const year = parseInt(val.slice(0, 4), 10);
        const month = parseInt(val.slice(4, 6), 10);
        const day = parseInt(val.slice(6, 8), 10);
        const date = new Date(year, month - 1, day);
        if (
          date.getFullYear() !== year ||
          date.getMonth() + 1 !== month ||
          date.getDate() !== day
        ) return false;
        const age = new Date().getFullYear() - year;
        return age >= 18;
      }, '만 18세 이상만 가입할 수 있어요'),
    university: z.string().optional(),
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
