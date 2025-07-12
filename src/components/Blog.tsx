import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  User, 
  Clock, 
  Tag,
  Search,
  TrendingUp,
  Microscope,
  Droplets,
  Fish
} from 'lucide-react';

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      id: '1',
      title: 'Understanding Shrimp Disease Prevention in Aquaculture',
      excerpt: 'Learn about the most common diseases affecting shrimp farms and how proper testing can prevent major losses.',
      content: `Shrimp farming is a critical industry in coastal regions, but disease outbreaks can devastate entire farms. Understanding the key diseases and implementing proper prevention strategies is essential for sustainable aquaculture.

The most common diseases affecting shrimp include White Spot Syndrome Virus (WSSV), Infectious Hypodermal and Hematopoietic Necrosis Virus (IHHNV), and Taura Syndrome Virus (TSV). Early detection through regular testing is crucial for preventing widespread outbreaks.

At NSP Labs, we provide comprehensive disease screening services that help farmers identify potential threats before they become major problems. Our testing protocols follow international standards and provide accurate, reliable results within 24-48 hours.

Prevention strategies include:
- Regular water quality monitoring
- Proper stocking density management
- Biosecurity measures
- Routine health screening
- Vaccination programs where applicable

By implementing these strategies and working with certified testing laboratories, shrimp farmers can significantly reduce disease-related losses and maintain healthy, productive farms.`,
      author: 'Dr. Sarah Martinez',
      date: '2024-01-15',
      category: 'Disease Prevention',
      readTime: '5 min read',
      image: 'https://images.pexels.com/photos/4992815/pexels-photo-4992815.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Shrimp Health', 'Disease Prevention', 'Aquaculture']
    },
    {
      id: '2',
      title: 'Water Quality Parameters: The Foundation of Successful Shrimp Farming',
      excerpt: 'Discover the critical water quality parameters that determine the success of your shrimp farming operation.',
      content: `Water quality is the foundation of successful shrimp farming. Poor water conditions can lead to stress, disease, and ultimately, significant economic losses. Understanding and monitoring key parameters is essential for maintaining a healthy aquaculture environment.

Key water quality parameters include:

**pH Levels**: Optimal range is 7.5-8.5. Fluctuations outside this range can stress shrimp and affect their immune system.

**Dissolved Oxygen**: Should be maintained above 5 ppm. Low oxygen levels can cause mortality and poor growth rates.

**Ammonia and Nitrite**: These toxic compounds should be kept at minimal levels through proper biofilter management.

**Salinity**: Varies by species but typically ranges from 15-25 ppt for most commercial shrimp.

**Temperature**: Optimal range is 28-32°C for most tropical shrimp species.

**Alkalinity**: Helps buffer pH changes and should be maintained at 80-120 ppm.

Regular testing of these parameters allows farmers to make timely adjustments and prevent problems before they occur. NSP Labs offers comprehensive water quality testing services with rapid turnaround times to help farmers maintain optimal conditions.

Investing in regular water quality monitoring is one of the most cost-effective ways to ensure the success of your shrimp farming operation.`,
      author: 'Dr. Michael Chen',
      date: '2024-01-10',
      category: 'Water Quality',
      readTime: '7 min read',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Water Quality', 'Testing', 'Farm Management']
    },
    {
      id: '3',
      title: 'Antibiotic Residue Testing: Ensuring Food Safety in Aquaculture',
      excerpt: 'Learn why antibiotic residue testing is crucial for export markets and consumer safety.',
      content: `Antibiotic residue testing has become increasingly important in aquaculture as global markets demand safer, higher-quality seafood products. Understanding the regulations and implementing proper testing protocols is essential for accessing premium markets.

**Why Antibiotic Residue Testing Matters:**

1. **Export Requirements**: Major importing countries have strict limits on antibiotic residues in seafood products.

2. **Consumer Safety**: Residues can contribute to antibiotic resistance and pose health risks.

3. **Market Access**: Certification of residue-free products opens doors to premium markets.

4. **Brand Protection**: Contaminated products can damage brand reputation and market position.

**Common Antibiotics Tested:**
- Chloramphenicol
- Nitrofurans
- Fluoroquinolones
- Tetracyclines
- Sulfonamides

**Best Practices for Farmers:**
- Follow withdrawal periods strictly
- Maintain detailed treatment records
- Use only approved antibiotics
- Implement preventive health management
- Regular testing before harvest

NSP Labs uses advanced analytical methods including LC-MS/MS to detect even trace amounts of antibiotic residues. Our testing meets international standards and provides the certification needed for export markets.

By implementing proper antibiotic management and regular testing, farmers can ensure their products meet the highest safety standards while accessing premium markets worldwide.`,
      author: 'Dr. Emily Rodriguez',
      date: '2024-01-05',
      category: 'Food Safety',
      readTime: '6 min read',
      image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Food Safety', 'Antibiotics', 'Export Quality']
    },
    {
      id: '4',
      title: 'Sustainable Aquaculture: Balancing Production and Environmental Protection',
      excerpt: 'Explore sustainable practices that maximize production while minimizing environmental impact.',
      content: `Sustainable aquaculture is no longer just an environmental concern—it's a business necessity. As the industry grows, implementing sustainable practices ensures long-term viability while meeting increasing consumer demand for responsibly produced seafood.

**Key Principles of Sustainable Aquaculture:**

**Environmental Stewardship:**
- Minimizing water pollution through proper waste management
- Protecting local ecosystems and biodiversity
- Reducing carbon footprint through efficient operations
- Implementing circular economy principles

**Economic Viability:**
- Optimizing feed conversion ratios
- Reducing disease-related losses
- Improving product quality and market value
- Implementing cost-effective technologies

**Social Responsibility:**
- Supporting local communities
- Ensuring worker safety and fair wages
- Maintaining transparent supply chains
- Engaging with stakeholders

**Practical Implementation:**

1. **Integrated Multi-Trophic Aquaculture (IMTA)**: Combining different species to utilize waste products and improve overall efficiency.

2. **Precision Feeding**: Using technology to optimize feeding schedules and reduce waste.

3. **Disease Prevention**: Focusing on prevention rather than treatment to reduce antibiotic use.

4. **Water Recirculation Systems**: Minimizing water usage and environmental impact.

5. **Renewable Energy**: Implementing solar, wind, or biogas systems to reduce energy costs.

**The Role of Testing:**
Regular monitoring and testing are essential for sustainable operations. This includes:
- Water quality monitoring
- Effluent testing
- Health screening
- Feed quality analysis
- Environmental impact assessment

NSP Labs supports sustainable aquaculture through comprehensive testing services that help farmers optimize their operations while meeting environmental standards.

The future of aquaculture depends on our ability to produce more with less environmental impact. By embracing sustainable practices and utilizing advanced testing technologies, the industry can continue to grow while protecting our planet's resources.`,
      author: 'Dr. James Wilson',
      date: '2023-12-28',
      category: 'Sustainability',
      readTime: '8 min read',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Sustainability', 'Environment', 'Best Practices']
    },
    {
      id: '5',
      title: 'Emerging Technologies in Aquaculture Testing',
      excerpt: 'Discover the latest technological advances that are revolutionizing aquaculture testing and monitoring.',
      content: `The aquaculture industry is experiencing a technological revolution that's transforming how we monitor, test, and manage aquatic farming operations. These emerging technologies are making testing more accurate, faster, and more accessible than ever before.

**Rapid Testing Technologies:**

**PCR and qPCR Systems:**
- Real-time pathogen detection
- Species identification
- Genetic marker analysis
- Results in 2-4 hours instead of days

**Biosensors:**
- Continuous monitoring of water parameters
- Real-time pathogen detection
- Automated alert systems
- Reduced labor costs

**Portable Testing Devices:**
- Field-deployable equipment
- Immediate results at farm sites
- Reduced transportation costs
- Faster decision-making

**Digital Integration:**

**IoT Sensors:**
- Continuous water quality monitoring
- Automated data collection
- Remote monitoring capabilities
- Predictive analytics

**Artificial Intelligence:**
- Pattern recognition in test results
- Predictive disease modeling
- Optimization of feeding schedules
- Early warning systems

**Blockchain Technology:**
- Traceability throughout supply chain
- Verification of test results
- Quality assurance documentation
- Consumer transparency

**Advanced Analytical Methods:**

**Mass Spectrometry:**
- Ultra-sensitive residue detection
- Multi-compound analysis
- Faster sample processing
- Lower detection limits

**Next-Generation Sequencing:**
- Comprehensive microbiome analysis
- Pathogen identification
- Antibiotic resistance monitoring
- Environmental DNA analysis

**Benefits for Farmers:**

1. **Faster Results**: Reduced turnaround times enable quicker decision-making
2. **Lower Costs**: Automation reduces testing expenses
3. **Better Accuracy**: Advanced methods provide more reliable results
4. **Preventive Management**: Early detection prevents major losses
5. **Market Access**: Better documentation supports premium market access

**Future Outlook:**

The integration of these technologies is creating a new paradigm in aquaculture management. Farmers can now access laboratory-quality testing at their farm sites, make data-driven decisions in real-time, and maintain comprehensive records for quality assurance.

At NSP Labs, we're continuously investing in these emerging technologies to provide our clients with the most advanced testing capabilities available. Our goal is to make high-quality testing accessible, affordable, and actionable for farmers of all sizes.

The future of aquaculture testing is here, and it's more powerful, accessible, and effective than ever before.`,
      author: 'Dr. Lisa Thompson',
      date: '2023-12-20',
      category: 'Technology',
      readTime: '9 min read',
      image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Technology', 'Innovation', 'Testing Methods']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Posts', icon: BookOpen },
    { id: 'Disease Prevention', name: 'Disease Prevention', icon: Microscope },
    { id: 'Water Quality', name: 'Water Quality', icon: Droplets },
    { id: 'Food Safety', name: 'Food Safety', icon: Fish },
    { id: 'Sustainability', name: 'Sustainability', icon: TrendingUp },
    { id: 'Technology', name: 'Technology', icon: TrendingUp }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/favicon.jpeg" 
                alt="NSP Labs Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">NSP Labs</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Analytical Labs Private Limited</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-12 sm:py-16 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">NSP Labs Blog</h1>
              <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8">
                Expert insights, industry trends, and practical guidance for aquaculture professionals
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                    selectedCategory === category.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-6 sm:space-y-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{post.title}</h2>
                  
                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                    <span className="text-xs sm:text-sm font-medium text-purple-600">{post.category}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    {expandedPost === post.id ? post.content : post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors text-sm sm:text-base"
                  >
                    {expandedPost === post.id ? 'Read Less' : 'Read More'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 text-sm sm:text-base">Try adjusting your search terms or category filter.</p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 sm:mt-12">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Subscribe to our newsletter for the latest insights and industry updates
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
              <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors text-sm sm:text-base">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;