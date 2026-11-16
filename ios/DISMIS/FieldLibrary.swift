import Foundation

struct FieldGuide: Decodable, Identifiable {
    let id: String
    let title: String
    let overview: String
    let materials: [String]
    let steps: [String]
    let warning: String
    let keywords: [String]?
}

struct FieldLibrary {
    let guides: [FieldGuide]

    init(bundle: Bundle = .main) throws {
        guard let url = bundle.url(forResource: "guides", withExtension: "json") else {
            throw CocoaError(.fileNoSuchFile)
        }
        guides = try JSONDecoder().decode([FieldGuide].self, from: Data(contentsOf: url))
    }

    func matches(_ text: String) -> [FieldGuide] {
        let query = Self.words(text).subtracting(Self.commonWords)
        guard !query.isEmpty else { return [] }
        return guides.enumerated().compactMap { index, guide -> (Int, Int, FieldGuide)? in
            let heading = Self.words(([guide.title] + (guide.keywords ?? [])).joined(separator: " "))
            let body = Self.words(([guide.overview] + guide.materials + guide.steps).joined(separator: " "))
            let score = heading.intersection(query).count * 5
                + body.subtracting(heading).intersection(query).count
            return score >= 3 ? (score, index, guide) : nil
        }.sorted { lhs, rhs in
            lhs.0 == rhs.0 ? lhs.1 < rhs.1 : lhs.0 > rhs.0
        }.prefix(3).map { $0.2 }
    }

    private static func words(_ input: String) -> Set<String> {
        Set(input.lowercased().split { !$0.isLetter && !$0.isNumber }.map { word in
            word.count > 4 && word.hasSuffix("s") ? String(word.dropLast()) : String(word)
        })
    }

    private static let commonWords: Set<String> = [
        "a", "am", "an", "and", "are", "can", "could", "do", "for", "from", "have",
        "how", "i", "in", "is", "it", "my", "of", "on", "or", "should", "the", "to",
        "use", "what", "when", "where", "which", "with", "would", "you", "your"
    ]
}
