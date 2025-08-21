export class ClassSubjectController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("classSubjects");
    this.teacherService = app.getService("teachers");
    this.anneeService = app.getService("annee_scolaire");
    this.classeService = app.getService("classes");
    this.subjectService = app.getService("subjects");
  }

  async loadClassSubjects(classId, anneeScolaireId) {
    try {
      return await this.service.getClassSubjects(classId, anneeScolaireId);
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les matières de la classe",
        "error"
      );
      throw error;
    }
  }

  async assignSubject(data) {
    try {
      const result = await this.service.assignSubject(data);
      this.app.eventBus.publish("class-subjects:updated");
      this.app.services.notifications.show(
        "Matière affectée à la classe avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'affectation";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async updateAssignment(id, data) {
    try {
      const result = await this.service.updateAssignment(id, data);
      this.app.eventBus.publish("class-subjects:updated");
      this.app.services.notifications.show(
        "Affectation mise à jour avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async removeAssignment(id) {
    try {
      await this.service.removeAssignment(id);
      this.app.eventBus.publish("class-subjects:updated");
      this.app.services.notifications.show(
        "Affectation supprimée avec succès",
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la suppression";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async getAllClasses() {
    try {
      return await this.classeService.getAllClasses();
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
      return [];
    }
  }

  async getAllSubjects() {
    try {
      return await this.subjectService.getAllSubjects();
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
      return [];
    }
  }

    async getAllTeachersWithSubjects() {
    try {
      // Utiliser le paramètre includeSubjects=true
      return await this.teacherService.getAllTeachers({
        includeSubjects: true,
        includeInactive: false // Seulement les professeurs actifs
      });
    } catch (error) {
      console.error("Erreur lors du chargement des professeurs avec matières:", error);
      return [];
    }
  }

  async getQualifiedTeachersForSubject(subjectId) {
    try {
      // Récupérer tous les professeurs avec leurs matières
      const teachers = await this.getAllTeachersWithSubjects();
      
      // Filtrer les professeurs qualifiés pour cette matière
      return teachers.filter(teacher =>
        teacher.teacherSubjects?.some(ts => ts.subjectId == subjectId)
      );
    } catch (error) {
      console.error("Erreur lors de la recherche des professeurs qualifiés:", error);
      return [];
    }
  }

  async getAnneeScolaireActive() {
    try {
      return await this.anneeService.getCurrent();
    } catch (error) {
      console.error("Erreur lors du chargement de l'année scolaire:", error);
      return null;
    }
  }
}
