import React, { useState } from 'react';
import { X, User, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import { ClassGrade } from '../types/exam';

interface StudentProfile {
  name: string;
  classGrade: ClassGrade;
  school?: string;
}

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentProfile.name);
  const [classGrade, setClassGrade] = useState<ClassGrade>(currentProfile.classGrade);
  const [school, setSchool] = useState(currentProfile.school || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveProfile({
      name: name.trim(),
      classGrade,
      school: school.trim() || undefined,
    });
    onClose();
  };

  const sampleSchools = [
    'Gayaza High School',
    'Namilyango College',
    'Mengo Senior School',
    'Greenhill Academy',
    'St. Mary\'s College Kisubi',
    'King\'s College Budo',
    'Kitante Primary School',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/60 backdrop-blur-sm animate-fade-in text-[#171717]">
      <div className="bg-white border border-[#d9e7fb] rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d9e7fb] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#edf3fd] text-[#005ce6] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#001f3f]">
                Student Profile
              </h3>
              <p className="text-xs text-[#5b6576] font-medium">Personalize your learning space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#7b8698] hover:text-[#171717] hover:bg-[#edf3fd] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#001f3f] font-bold mb-1.5">Your Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kato Brian or Amina Nalule"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7fd] border border-[#d9e7fb] text-[#171717] text-sm focus:border-[#005ce6] focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-[#001f3f] font-bold mb-1.5">Class / Level</label>
            <select
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value as ClassGrade)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7fd] border border-[#d9e7fb] text-[#171717] text-sm focus:border-[#005ce6] focus:bg-white focus:outline-none font-medium"
            >
              <optgroup label="Primary (Upper Primary)">
                <option value="P.7">P.7 (Primary Leaving Examination - PLE)</option>
                <option value="P.6">P.6 Primary</option>
                <option value="P.5">P.5 Primary</option>
              </optgroup>
              <optgroup label="Lower Secondary (O-Level)">
                <option value="S.4">S.4 (Uganda Certificate of Education - UCE)</option>
                <option value="S.3">S.3 Lower Secondary</option>
                <option value="S.2">S.2 Lower Secondary</option>
                <option value="S.1">S.1 Lower Secondary</option>
              </optgroup>
              <optgroup label="Upper Secondary (A-Level)">
                <option value="S.6">S.6 (Uganda Advanced Certificate of Education - UACE)</option>
                <option value="S.5">S.5 Upper Secondary</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[#001f3f] font-bold mb-1.5">School (Optional)</label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g. Gayaza High School or Mengo Senior School"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7fd] border border-[#d9e7fb] text-[#171717] text-sm focus:border-[#005ce6] focus:bg-white focus:outline-none font-medium"
            />
            {/* Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
              <span className="text-[10px] text-[#7b8698]">Examples:</span>
              {sampleSchools.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSchool(s)}
                  className="text-[10px] text-[#005ce6] hover:underline cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="btn btn-primary w-full !py-3 text-xs sm:text-sm font-bold shadow-md shadow-[#005ce6]/20"
            >
              <span>Save & Continue Learning</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
