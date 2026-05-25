import React from "react";
import { TextInputField } from "../TextInputField";
import { TextAreaField } from "../TextAreaField";
import { PhoneInputField } from "../PhoneInputField";
import { EmailAutocomplete } from "../EmailAutocomplete";
import { IntakeFormPayload } from "@/lib/schema";
import { Plus, Link as LinkIcon, X, ShoppingBag, Store, Smartphone, Globe } from "lucide-react";

interface Step1IdentityProps {
  data: IntakeFormPayload;
  updateData: (updates: Partial<IntakeFormPayload>) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({ data, updateData, errors = {}, clearError }) => {
  const handleSocialLinkChange = (index: number, url: string) => {
    const newLinks = [...(data.socialLinks || [])];
    newLinks[index].url = url;

    const lowerUrl = url.toLowerCase();

    // Auto-detect platform with support for short URLs
    if (/(instagram\.com|instagr\.am|ig\.me)/.test(lowerUrl)) {
      newLinks[index].platform = 'Instagram';
    } else if (/(youtube\.com|youtu\.be)/.test(lowerUrl)) {
      newLinks[index].platform = 'YouTube';
    } else if (/(twitter\.com|x\.com|t\.co)/.test(lowerUrl)) {
      newLinks[index].platform = 'Twitter';
    } else if (/(linkedin\.com|lnkd\.in)/.test(lowerUrl)) {
      newLinks[index].platform = 'LinkedIn';
    } else if (/(facebook\.com|fb\.com|fb\.me)/.test(lowerUrl)) {
      newLinks[index].platform = 'Facebook';
    } else if (/(shopify\.com|myshopify\.com)/.test(lowerUrl)) {
      newLinks[index].platform = 'Shopify';
    } else if (/(etsy\.com|etsy\.me)/.test(lowerUrl)) {
      newLinks[index].platform = 'Etsy';
    } else if (/(apps\.apple\.com|appstore\.com)/.test(lowerUrl)) {
      newLinks[index].platform = 'App Store';
    } else if (/(play\.google\.com)/.test(lowerUrl)) {
      newLinks[index].platform = 'Google Play';
    } else {
      newLinks[index].platform = 'Website';
    }

    updateData({ socialLinks: newLinks });
  };

  const addSocialLink = () => {
    const newLinks = [...(data.socialLinks || []), { platform: "Website", url: "" }];
    updateData({ socialLinks: newLinks });
  };

  const getPlatformIcon = (platform: string) => {
    const svgProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
    switch (platform) {
      case 'Instagram': return <svg className="w-5 h-5 text-pink-400" {...svgProps}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
      case 'YouTube': return <svg className="w-5 h-5 text-red-500" {...svgProps}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>;
      case 'Twitter': return <svg className="w-5 h-5 text-blue-400" {...svgProps}><path d="M4 4l11.73 16h5L9 4z" /><path d="M4 20l6.76-6.76" /><path d="M20 4l-6.76 6.76" /></svg>;
      case 'LinkedIn': return <svg className="w-5 h-5 text-blue-600" {...svgProps}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
      case 'Facebook': return <svg className="w-5 h-5 text-blue-500" {...svgProps}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
      case 'Shopify': return <ShoppingBag className="w-5 h-5 text-[#95BF47]" />;
      case 'Etsy': return <Store className="w-5 h-5 text-[#F56400]" />;
      case 'App Store': return <Smartphone className="w-5 h-5 text-white" />;
      case 'Google Play': return <Smartphone className="w-5 h-5 text-green-400" />;
      case 'Website': return <Globe className="w-5 h-5 text-white/60" />;
      default: return <LinkIcon className="w-5 h-5 text-white/60" />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Identity Section */}
      <div className="glass p-8 flex flex-col gap-6 relative z-30">
        <h2 className="text-xl font-semibold mb-2">Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInputField
            label="Client Name"
            placeholder="e.g. John Doe"
            value={data.clientName || ""}
            onChange={(e) => updateData({ clientName: e.target.value })}
            onBlur={() => { if (data.clientName?.trim() && clearError) clearError('clientName') }}
            required
            maxLength={40}
            error={errors.clientName}
          />
          <TextInputField
            label="Business Name"
            placeholder="e.g. Acme Corp"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
            onBlur={() => { if (data.businessName?.trim() && clearError) clearError('businessName') }}
            required
            maxLength={40}
            error={errors.businessName}
          />
        </div>
        <TextInputField
          label="Slogan"
          placeholder="e.g. Building the future, today."
          value={data.tagline}
          onChange={(e) => updateData({ tagline: e.target.value })}
          onBlur={() => { if (data.tagline?.trim() && clearError) clearError('tagline') }}
          required
          maxLength={60}
          error={errors.tagline}
        />
        <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6 z-30 relative">
          <EmailAutocomplete
            label="Email Address"
            placeholder="hello@example.com"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            onBlur={() => { if (data.email?.trim() && clearError) clearError('email') }}
            required
            error={errors.email}
          />
          <PhoneInputField
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={data.phone || ""}
            onChange={(val) => updateData({ phone: val })}
          />
        </div>
      </div>

      {/* Core Initiative Section */}
      <div className="glass p-8 flex flex-col gap-6 relative z-20">
        <h2 className="text-xl font-semibold mb-2">Core Initiative</h2>
        <TextAreaField
          label="What do you do?"
          placeholder="Describe the primary mission and day-to-day operations..."
          value={data.whatDoYouDo}
          onChange={(e) => {
            updateData({ whatDoYouDo: e.target.value });
            if (clearError) clearError('whatDoYouDo');
          }}
          required
          maxLength={500}
          error={errors.whatDoYouDo}
        />
      </div>

      {/* Online Presence Section */}
      <div className="glass p-8 flex flex-col gap-6 relative z-10">
        <div className="flex flex-col gap-1 mb-2">
          <h2 className="text-xl font-semibold">Online Presence</h2>
          <span className="text-xs text-white/50">Include your existing websites, apps, social media, or shops.</span>
        </div>
        <div className="flex flex-col gap-4">
          {data.socialLinks?.map((link, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#121c33]/80 border border-white/10 flex items-center justify-center relative group cursor-pointer hover:bg-[#121c33] transition-colors">
                {getPlatformIcon(link.platform)}
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={link.platform}
                  onChange={(e) => {
                    const newLinks = [...(data.socialLinks || [])];
                    const val = e.target.value;
                    newLinks[idx].platform = val;

                    const bases: Record<string, string> = {
                      'Instagram': 'instagram.com/',
                      'Twitter': 'twitter.com/',
                      'LinkedIn': 'linkedin.com/in/',
                      'Facebook': 'facebook.com/',
                      'YouTube': 'youtube.com/@',
                      'Shopify': 'myshopify.com/',
                      'Etsy': 'etsy.com/shop/'
                    };

                    if (bases[val] && (!newLinks[idx].url || newLinks[idx].url === '' || newLinks[idx].url === 'https://')) {
                      newLinks[idx].url = bases[val];
                    }
                    updateData({ socialLinks: newLinks });
                  }}
                >
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter (X)</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Facebook">Facebook</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Shopify">Shopify</option>
                  <option value="Etsy">Etsy</option>
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(idx, e.target.value)}
                  onBlur={(e) => {
                    let val = e.target.value.trim();
                    if (val && !val.includes('/') && !val.includes('http')) {
                      const bases: Record<string, string> = {
                        'Instagram': 'https://instagram.com/',
                        'LinkedIn': 'https://linkedin.com/in/',
                        'Twitter': 'https://twitter.com/',
                        'Facebook': 'https://facebook.com/',
                        'YouTube': 'https://youtube.com/@',
                      };
                      const base = bases[link.platform];
                      if (base) {
                        handleSocialLinkChange(idx, base + val);
                      }
                    }
                  }}
                  placeholder={`e.g. ${link.platform.toLowerCase()}.com/...`}
                  className="glass-input w-full"
                />
              </div>
              <button onClick={() => {
                const newLinks = [...(data.socialLinks || [])];
                newLinks.splice(idx, 1);
                updateData({ socialLinks: newLinks });
              }} className="text-white/30 hover:text-red-400 p-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addSocialLink}
          className="w-full flex items-center justify-center gap-2 py-3 mt-2 border border-dashed border-white/20 rounded-md text-sm text-white/60 hover:text-white hover:border-white/40 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>
    </div>
  );
};
