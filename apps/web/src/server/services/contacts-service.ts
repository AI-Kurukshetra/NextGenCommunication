import { ContactsRepository } from "@/server/repositories/contacts-repository";

export class ContactsService {
  private readonly contactsRepository = new ContactsRepository();

  parseCsv(csv: string) {
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const [header, ...body] = lines;
    const columns = header.split(",").map((column) => column.trim().toLowerCase());

    return body.map((line) => {
      const values = line.split(",").map((value) => value.trim());
      const index = (name: string) => columns.indexOf(name);

      return {
        phone: values[index("phone")],
        firstName: values[index("first_name")] || undefined,
        lastName: values[index("last_name")] || undefined,
        email: values[index("email")] || undefined,
        tags: values[index("tags")] ? values[index("tags")].split("|") : []
      };
    });
  }

  async importCsv(payload: {
    organizationId: string;
    applicationId: string;
    csv: string;
  }) {
    const contacts = this.parseCsv(payload.csv).filter((contact) => contact.phone);

    await this.contactsRepository.upsertMany(payload.organizationId, payload.applicationId, contacts);

    return {
      imported: contacts.length
    };
  }
}
