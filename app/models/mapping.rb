class Mapping

  include Mongoid::Document

  before_create :set_score, :set_section
  before_update :set_score, :set_section
  before_save :set_score, :set_section

  field :mapping_id, :type => String
  field :score, :type => String, :default => '0.0'
  field :section, :type => String

  has_many :reviews, dependent: :delete

  validates :mapping_id, :presence => true

  def set_score
    reviews_count = self.reviews.count
    positive_reviews_count = self.reviews.where(:result => "positive").count
    score = positive_reviews_count.percent_of(reviews_count)
    self.score = score 
  end

  def set_section
    section = []
    mapping = MigratoratorApi::Mapping.find_by_id(self.mapping_id)  
    mapping.tags.each do |tag|
      section << tag.scan(/section:\w+/)
    end
    section.flatten!
    if section[0] != nil
      self.section = section[0].sub(/^section:/, '')
    end
  end

end