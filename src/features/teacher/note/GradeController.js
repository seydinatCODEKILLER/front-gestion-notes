export class GradeController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("grades");
    this.classService = app.getService("classes");
    this.subjectService = app.getService("subjects");
  }

  async loadClassGrades(classId, filters = {}) {
    try {
      return await this.service.getClassGrades(classId, filters);
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les notes de la classe",
        "error"
      );
      throw error;
    }
  }

  async loadTeacherClasses(teacherId) {
    try {
      return await this.service.getClassesByTeacher(teacherId);
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger vos classes",
        "error"
      );
      throw error;
    }
  }

  async loadTeacherSubjects(teacherId) {
    try {
      return await this.service.getSubjectsByTeacher(teacherId);
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger vos matières",
        "error"
      );
      throw error;
    }
  }

  async loadTrimestres() {
    try {
      return await this.service.getTrimestres();
    } catch (error) {
      console.error("Erreur lors du chargement des trimestres:", error);
      return [];
    }
  }

  async loadStudentsByClass(classId) {
    try {
      return await this.service.getStudentsByClass(classId);
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les élèves de la classe",
        "error"
      );
      throw error;
    }
  }

  async saveGrade(data) {
    try {
      const result = await this.service.createGrade(data);
      this.app.eventBus.publish("grades:updated");
      this.app.services.notifications.show(
        "Note enregistrée avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'enregistrement";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async saveGradesBatch(gradesData) {
    try {
      const result = await this.service.saveGradesBatch(gradesData);
      this.app.eventBus.publish("grades:updated");
      this.app.services.notifications.show(
        "Notes enregistrées avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'enregistrement";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async updateGrade(id, data) {
    try {
      const result = await this.service.updateGrade(id, data);
      this.app.eventBus.publish("grades:updated");
      this.app.services.notifications.show(
        "Note mise à jour avec succès",
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
}
