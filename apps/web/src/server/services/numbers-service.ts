import { NumbersRepository } from "@/server/repositories/numbers-repository";

export class NumbersService {
  private readonly numbersRepository = new NumbersRepository();

  async purchase(payload: {
    organizationId: string;
    applicationId: string;
    countryCode: string;
    numberType: "local" | "toll_free" | "mobile";
    capabilities: string[];
  }) {
    const randomLocal = Math.floor(1000000 + Math.random() * 9000000);
    const e164 = `+1${randomLocal}`;

    const number = await this.numbersRepository.purchase({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      e164Number: e164,
      countryCode: payload.countryCode,
      numberType: payload.numberType,
      capabilities: payload.capabilities,
      provider: "mock"
    });

    return number;
  }

  async port(payload: {
    organizationId: string;
    applicationId: string;
    phoneNumber: string;
    countryCode: string;
    numberType: "local" | "toll_free" | "mobile";
    capabilities: string[];
  }) {
    return this.numbersRepository.port({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      e164Number: payload.phoneNumber,
      countryCode: payload.countryCode,
      numberType: payload.numberType,
      capabilities: payload.capabilities
    });
  }

  async assign(payload: {
    organizationId: string;
    phoneNumberId: string;
    applicationId: string;
  }) {
    return this.numbersRepository.assign(payload);
  }
}
