import { AppError } from "@/lib/errors";
import { EmergencyRepository } from "@/server/repositories/emergency-repository";

export class EmergencyService {
  private readonly emergencyRepository = new EmergencyRepository();

  async listLocations(organizationId: string) {
    return this.emergencyRepository.listLocations(organizationId);
  }

  async createLocation(payload: {
    organizationId: string;
    label: string;
    countryCode: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    metadata?: Record<string, unknown>;
  }) {
    return this.emergencyRepository.createLocation(payload);
  }

  async assignNumber(payload: {
    organizationId: string;
    phoneNumberId: string;
    locationId: string;
    metadata?: Record<string, unknown>;
  }) {
    const phone = await this.emergencyRepository.ensurePhoneBelongsToOrg({
      organizationId: payload.organizationId,
      phoneNumberId: payload.phoneNumberId
    });

    if (!phone) {
      throw new AppError("Phone number not found for organization", {
        status: 404,
        code: "phone_number_not_found"
      });
    }

    const location = await this.emergencyRepository.ensureLocationBelongsToOrg({
      organizationId: payload.organizationId,
      locationId: payload.locationId
    });

    if (!location) {
      throw new AppError("Emergency location not found for organization", {
        status: 404,
        code: "emergency_location_not_found"
      });
    }

    await this.emergencyRepository.deactivateAssignmentsForPhone({
      organizationId: payload.organizationId,
      phoneNumberId: payload.phoneNumberId
    });

    return this.emergencyRepository.assignPhoneToLocation(payload);
  }
}
